import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import Service from '../models/Service.js';
import Product from '../models/Product.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logAction } from '../../../services/audit.service.js';
import { INVOICE_STATUS, INVOICE_TYPE, ORDER_STATUS, BILLING_CYCLE_MONTHS } from '../../../constants/billing.js';

export const createOrder = async (orderData, req) => {
    const { userId, items, paymentMethod, promoCode, clientIp, userAgent } = orderData;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];
    
    // Fix N+1 query: fetch all products at once
    const productIds = [
        ...items.map(item => item.productId),
        ...items.flatMap(item => (item.addons || []).map(a => a.addonId || a._id))
    ];
    const productsList = await Product.find({ _id: { $in: productIds } });
    const productMap = Object.fromEntries(productsList.map(p => [p._id.toString(), p]));
    
    for (const item of items) {
        const product = productMap[item.productId.toString()];
        if (!product || product.status !== 'active') {
            throw new ApiError(400, `Product ${item.productId} is not available`);
        }
        
        // Get pricing for the selected cycle
        const pricing = product.pricing.find(p => p.cycle === item.cycle && p.isActive);
        if (!pricing) {
            throw new ApiError(400, `Pricing for cycle ${item.cycle} not available`);
        }
        
        const quantity = item.quantity || 1;
        const itemTotal = (pricing.price + (pricing.setupFee || 0)) * quantity;
        
        orderItems.push({
            productId: product._id,
            productName: product.name,
            productType: product.type,
            configuration: item.configuration,
            cycle: item.cycle,
            unitPrice: pricing.price,
            setupFee: pricing.setupFee || 0,
            total: itemTotal,
            domain: item.domain,
            registrationPeriod: item.domain ? item.registrationPeriod : undefined,
            addons: item.addons || [],
        });
        
        subtotal += itemTotal;
        
        // Add addon prices securely
        if (item.addons?.length > 0) {
            for (const addon of item.addons) {
                const addonIdStr = (addon.addonId || addon._id).toString();
                const addonProduct = productMap[addonIdStr];
                if (addonProduct && addonProduct.status === 'active') {
                    const addonPricing = addonProduct.pricing?.find(p => p.cycle === item.cycle && p.isActive) || addonProduct.pricing?.[0];
                    if (addonPricing) {
                        const addonPrice = addonPricing.price;
                        subtotal += addonPrice;
                        orderItems[orderItems.length - 1].total += addonPrice;
                        addon.price = addonPrice;
                        addon.name = addonProduct.name;
                    }
                }
            }
        }
    }
    
    // Apply promo code discount
    let discount = 0;
    let discountCode = null;
    if (promoCode) {
        const PromoCode = (await import('../models/PromoCode.js')).default;
        const promo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
        
        if (promo) {
            const validation = promo.isValid(userId, subtotal);
            if (validation.valid) {
                discount = promo.calculateDiscount(subtotal, orderItems[0]?.cycle);
                discountCode = promo.code;
                
                // Increment usage
                promo.usedCount += 1;
                await promo.save();
            }
        }
    }
    
    const tax = 0; // Could be calculated based on user location
    const total = subtotal - discount + tax;
    
    // Create order
    const order = await Order.create({
        userId,
        items: orderItems,
        subtotal,
        discount,
        discountCode,
        tax,
        total,
        paymentMethod,
        clientIp: clientIp || req?.ip,
        userAgent: userAgent || req?.headers?.['user-agent'],
        status: ORDER_STATUS.PENDING,
    });
    
    // Create invoice for the order
    const invoice = await createInvoiceFromOrder(order, req);
    
    order.invoiceId = invoice._id;
    await order.save();
    
    await logAction({
        userId,
        action: 'order.created',
        metadata: { orderId: order._id, total: order.total },
        req,
    });
    
    return { order, invoice };
};

export const createInvoiceFromOrder = async (order, req) => {
    const invoiceItems = order.items.map(item => ({
        description: item.productName,
        quantity: 1,
        unitPrice: item.unitPrice + (item.setupFee || 0),
        total: item.total,
        productId: item.productId,
        lineItemType: item.productType === 'addon' ? 'addon' : 'product',
    }));
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days
    
    const invoice = await Invoice.create({
        userId: order.userId,
        type: INVOICE_TYPE.NEW,
        status: INVOICE_STATUS.DRAFT,
        orderId: order._id,
        items: invoiceItems,
        subtotal: order.subtotal,
        discount: order.discount,
        discountCode: order.discountCode,
        tax: order.tax,
        total: order.total,
        amountDue: order.total,
        dueDate,
        currency: 'INR',
    });
    
    // Change invoice status to unpaid
    invoice.status = INVOICE_STATUS.UNPAID;
    await invoice.save();
    
    return invoice;
};

export const getInvoiceById = async (invoiceId, userId) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        throw new ApiError(404, 'Invoice not found');
    }
    
    // Check access
    if (invoice.userId.toString() !== userId.toString()) {
        throw new ApiError(403, 'Access denied');
    }
    
    return invoice;
};

export const listInvoices = async (userId, filters, pagination) => {
    let { page = 1, limit = 20 } = pagination;
    
    limit = Math.min(parseInt(limit), 100);
    page = Math.max(parseInt(page), 1);
    
    const query = { userId };
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    if (filters.type) {
        query.type = filters.type;
    }
    
    if (filters.dateFrom || filters.dateTo) {
        query.dateIssued = {};
        if (filters.dateFrom) query.dateIssued.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.dateIssued.$lte = new Date(filters.dateTo);
    }
    
    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
        Invoice.find(query)
            .sort({ dateIssued: -1 })
            .skip(skip)
            .limit(limit)
            .populate('orderId', 'orderNumber'),
        Invoice.countDocuments(query),
    ]);
    
    return {
        invoices,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

export const listAllInvoices = async (filters, pagination) => {
    let { page = 1, limit = 20 } = pagination;
    
    limit = Math.min(parseInt(limit), 100);
    page = Math.max(parseInt(page), 1);
    
    const query = {};
    
    if (filters.userId) query.userId = filters.userId;
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.dateFrom || filters.dateTo) {
        query.dateIssued = {};
        if (filters.dateFrom) query.dateIssued.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.dateIssued.$lte = new Date(filters.dateTo);
    }
    
    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
        Invoice.find(query)
            .sort({ dateIssued: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email')
            .populate('orderId', 'orderNumber'),
        Invoice.countDocuments(query),
    ]);
    
    return {
        invoices,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

export const createManualInvoice = async (invoiceData) => {
    const { userId, items, status = INVOICE_STATUS.UNPAID, dueDate, tax = 0, discount = 0, currency = 'INR', type = INVOICE_TYPE.NEW } = invoiceData;
    
    let subtotal = 0;
    const formattedItems = items.map(item => {
        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;
        return {
            ...item,
            total: itemTotal
        };
    });
    
    const total = subtotal - discount + tax;
    
    const invoice = await Invoice.create({
        userId,
        type,
        status,
        items: formattedItems,
        subtotal,
        discount,
        tax,
        total,
        amountDue: total,
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        currency,
        dateIssued: new Date()
    });
    
    return invoice;
};

export const updateInvoiceStatus = async (invoiceId, status) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) throw new ApiError(404, 'Invoice not found');

    if (status === INVOICE_STATUS.PAID && invoice.status !== INVOICE_STATUS.PAID) {
        invoice.amountDue = 0;
        invoice.datePaid = new Date();
        invoice.amountPaid = invoice.total;
    } else if (status !== INVOICE_STATUS.PAID) {
        invoice.amountDue = invoice.total;
        invoice.datePaid = null;
        invoice.amountPaid = 0;
    }

    invoice.status = status;
    
    if (!invoice.history) invoice.history = [];
    invoice.history.push({
        date: new Date(),
        action: 'status_changed',
        description: `Status manually changed to ${status}`,
    });

    await invoice.save();
    return invoice;
};

export const markInvoiceAsPaid = async (invoiceId, paymentData, req) => {
    console.log('[BillingService] markInvoiceAsPaid called:', { invoiceId, paymentMethod: paymentData.paymentMethod });
    
    // NOTE: No transactions — local MongoDB standalone does not support them.
    // Operations are sequential. If a step fails, the error is logged and re-thrown.
    
    console.log('[BillingService] Finding invoice:', invoiceId);
    let invoice;
    try {
        invoice = await Invoice.findById(invoiceId);
    } catch (err) {
        console.error('[BillingService] Invalid invoice ID format:', invoiceId);
        throw new ApiError(400, 'Invalid invoice ID format');
    }
    
    if (!invoice) {
        console.error('[BillingService] Invoice NOT FOUND in DB:', invoiceId);
        throw new ApiError(404, 'Invoice not found');
    }
    
    console.log('[BillingService] Invoice found:', { 
        id: invoice._id, 
        userId: invoice.userId,
        status: invoice.status,
        total: invoice.total 
    });
    
    if (invoice.status === INVOICE_STATUS.PAID) {
        console.log('[BillingService] Invoice already paid');
        throw new ApiError(400, 'Invoice already paid');
    }
    
    invoice.status = INVOICE_STATUS.PAID;
    invoice.datePaid = new Date();
    invoice.paymentMethod = paymentData.paymentMethod;
    invoice.transactionId = paymentData.transactionId;
    invoice.amountPaid = invoice.total;
    invoice.amountDue = 0;
    invoice.paymentAttempts = (invoice.paymentAttempts || 0) + 1;
    invoice.lastPaymentAttempt = new Date();
    
    if (!invoice.history) invoice.history = [];
    invoice.history.push({
        date: new Date(),
        action: 'paid',
        description: `Invoice paid via ${paymentData.paymentMethod}`,
        userId: req?.userId,
    });
    
    console.log('[BillingService] Saving invoice...');
    await invoice.save();
    console.log('[BillingService] Invoice saved successfully');
    
    // Update order status if exists
    if (invoice.orderId) {
        console.log('[BillingService] Updating linked order:', invoice.orderId);
        const order = await Order.findByIdAndUpdate(invoice.orderId, {
            status: ORDER_STATUS.COMPLETED,
            paymentStatus: 'paid',
        }, { new: true });
        
        if (order) {
            console.log('[BillingService] Order updated to COMPLETED:', order._id);
        } else {
            console.warn('[BillingService] Linked order NOT FOUND during update:', invoice.orderId);
        }
        
        // Create services from order items
        try {
            await createServicesFromOrder(invoice.orderId);
        } catch (svcErr) {
            // Log but don't fail the payment — services can be provisioned manually
            console.error('[BillingService] Failed to create services (non-fatal):', svcErr.message);
        }
    }
    
    await logAction({
        userId: invoice.userId,
        action: 'invoice.paid',
        metadata: { invoiceId: invoice._id, amount: invoice.total },
        req,
    });
    
    console.log('[BillingService] markInvoiceAsPaid completed successfully');
    return invoice;
};

export const createServicesFromOrder = async (orderId) => {
    console.log('[BillingService] Provisioning services for order:', orderId);
    const order = await Order.findById(orderId);
    if (!order) {
        console.error('[BillingService] Order NOT FOUND for service provisioning:', orderId);
        return;
    }
    
    const services = [];
    
    for (const item of order.items) {
        const product = await Product.findById(item.productId);
        
        // Calculate next due date
        const nextDueDate = new Date();
        const months = BILLING_CYCLE_MONTHS[item.cycle] || 1;
        nextDueDate.setMonth(nextDueDate.getMonth() + months);
        
        const service = await Service.create([{
            userId: order.userId,
            productId: item.productId,
            productName: item.productName,
            productType: item.productType,
            configuration: item.configuration,
            domain: item.domain,
            registrationPeriod: item.registrationPeriod,
            status: 'active', // Activated immediately on payment success
            cycle: item.cycle,
            firstPaymentAmount: item.unitPrice,
            recurringAmount: item.unitPrice,
            setupFee: item.setupFee || 0,
            nextDueDate,
            orderId: order._id,
            initialInvoiceId: order.invoiceId,
            addons: item.addons?.map(a => ({
                addonId: a.addonId,
                name: a.name,
                recurringAmount: a.price,
                status: 'active',
                nextDueDate,
            })),
        }]);
        
        services.push(...service);
        
        // Update order item with service ID
        item.serviceId = service[0]._id;
    }
    
    await order.save();
    
    return services;
};


export const getOrderById = async (orderId, userId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, 'Order not found');
    }
    
    // Check access
    if (order.userId.toString() !== userId.toString()) {
        throw new ApiError(403, 'Access denied');
    }
    
    return order;
};

export const listOrders = async (userId, filters, pagination) => {
    let { page = 1, limit = 20 } = pagination;
    
    limit = Math.min(parseInt(limit), 100);
    page = Math.max(parseInt(page), 1);
    
    const query = { userId };
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
        Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order.countDocuments(query),
    ]);
    
    return {
        orders,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

export const listAllOrders = async (filters, pagination) => {
    let { page = 1, limit = 20 } = pagination;
    limit = Math.min(parseInt(limit), 100);
    page = Math.max(parseInt(page), 1);
    const query = {};
    if (filters.status) query.status = filters.status;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(query),
    ]);
    return {
        orders,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

export const cancelOrder = async (orderId, userId, reason, req) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new ApiError(404, 'Order not found');
        }
        
        if (order.userId.toString() !== userId.toString()) {
            throw new ApiError(403, 'Access denied');
        }
        
        if (!['pending', 'processing'].includes(order.status)) {
            throw new ApiError(400, 'Order cannot be cancelled');
        }
        
        order.status = ORDER_STATUS.CANCELLED;
        order.notes = reason;
        order.history.push({
            date: new Date(),
            status: ORDER_STATUS.CANCELLED,
            description: 'Order cancelled by customer',
            userId,
        });
        
        await order.save();
        
        // Cancel associated invoice if exists
        if (order.invoiceId) {
            await Invoice.findByIdAndUpdate(order.invoiceId, {
                status: INVOICE_STATUS.CANCELLED,
            });
        }
        
        await logAction({
            userId,
            action: 'order.cancelled',
            metadata: { orderId: order._id, reason },
            req,
        });
        
        return order;
    } catch (error) {
        throw error;
    }
};

export const updateOrderStatus = async (orderId, status, reason, req) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    const oldStatus = order.status;
    order.status = status;
    if (reason) order.notes = reason;

    if (status === 'cancelled' && order.invoiceId) {
        await Invoice.findByIdAndUpdate(order.invoiceId, {
            status: INVOICE_STATUS.CANCELLED,
        });
    }

    order.history.push({
        date: new Date(),
        status: status,
        description: reason || `Status changed from ${oldStatus} to ${status}`,
        userId: req.userId,
    });

    await order.save();

    await logAction({
        userId: req.userId,
        action: 'order.status_updated',
        metadata: { orderId: order._id, oldStatus, newStatus: status, reason },
        req,
    });

    return order;
};

export const calculateProration = async (serviceId, newCycle) => {
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError(404, 'Service not found');
    }
    
    const product = await Product.findById(service.productId);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }
    
    const newPricing = product.pricing.find(p => p.cycle === newCycle && p.isActive);
    if (!newPricing) {
        throw new ApiError(400, 'Invalid billing cycle');
    }
    
    // Calculate days remaining in current cycle
    const now = new Date();
    const daysRemaining = Math.ceil((service.nextDueDate - now) / (1000 * 60 * 60 * 24));
    const daysInMonth = 30; // Simplified
    const remainingPercent = daysRemaining / daysInMonth;
    
    // Calculate credit for unused time
    const creditAmount = service.recurringAmount * remainingPercent;
    
    // Calculate new cycle cost
    const newAmount = newPricing.price;
    
    // Amount to pay (new - credit)
    let amountDue = newAmount - creditAmount;
    if (amountDue < 0) amountDue = 0;
    
    return {
        currentCycle: service.cycle,
        newCycle,
        creditAmount: Math.max(0, creditAmount),
        newAmount,
        amountDue,
        daysRemaining,
    };
};

export const processRenewalInvoices = async () => {
    // Find services due for renewal
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Invoice 7 days before due
    
    const services = await Service.find({
        status: 'active',
        autoRenew: true,
        nextDueDate: { $lte: dueDate },
    }).populate('productId');
    
    const results = {
        invoicesCreated: 0,
        invoicesFailed: 0,
        errors: [],
    };
    
    for (const service of services) {
        try {
            // Check if already has pending invoice
            const existingInvoice = await Invoice.findOne({
                userId: service.userId,
                type: INVOICE_TYPE.RENEWAL,
                status: { $in: [INVOICE_STATUS.DRAFT, INVOICE_STATUS.UNPAID] },
                'items.serviceId': service._id,
            });
            
            if (existingInvoice) continue;
            
            await createRenewalInvoice(service);
            results.invoicesCreated += 1;
        } catch (error) {
            results.invoicesFailed += 1;
            results.errors.push({ serviceId: service._id, error: error.message });
        }
    }
    
    return results;
};

export const createRenewalInvoice = async (service) => {
    const product = await Product.findById(service.productId);
    const pricing = product.pricing.find(p => p.cycle === service.cycle && p.isActive);
    
    if (!pricing) {
        throw new ApiError(400, 'Pricing not available for renewal');
    }
    
    const periodStart = service.nextDueDate;
    const periodEnd = new Date(service.nextDueDate);
    periodEnd.setMonth(periodEnd.getMonth() + (BILLING_CYCLE_MONTHS[service.cycle] || 1));
    
    const items = [{
        description: `${service.productName} - ${service.cycle} renewal`,
        quantity: 1,
        unitPrice: pricing.price,
        total: pricing.price,
        serviceId: service._id,
        lineItemType: 'service',
        periodStart,
        periodEnd,
    }];
    
    // Add addon renewals
    for (const addon of service.addons || []) {
        if (addon.status === 'active') {
            items.push({
                description: `${addon.name} - Addon renewal`,
                quantity: 1,
                unitPrice: addon.recurringAmount,
                total: addon.recurringAmount,
                serviceId: service._id,
                lineItemType: 'addon',
                periodStart,
                periodEnd,
            });
        }
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    
    const invoice = await Invoice.create({
        userId: service.userId,
        type: INVOICE_TYPE.RENEWAL,
        status: INVOICE_STATUS.UNPAID,
        items,
        subtotal,
        total: subtotal,
        amountDue: subtotal,
        dueDate,
        currency: 'INR',
    });
    
    return invoice;
};

export const suspendOverdueServices = async () => {
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - 7); // 7 days overdue
    
    const services = await Service.find({
        status: 'active',
        nextDueDate: { $lt: overdueDate },
    });
    
    for (const service of services) {
        service.status = 'suspended';
        await service.save();
        
        await logAction({
            userId: service.userId,
            action: 'service.suspended',
            metadata: { serviceId: service._id, reason: 'overdue' },
        });
    }
    
    return { suspendedCount: services.length };
};

export const listAllServices = async (filters, pagination) => {
    let { page = 1, limit = 20 } = pagination;
    
    limit = Math.min(parseInt(limit), 100);
    page = Math.max(parseInt(page), 1);
    
    const query = {};
    
    if (filters.userId) query.userId = filters.userId;
    if (filters.status) query.status = filters.status;
    if (filters.productType) query.productType = filters.productType;
    
    const skip = (page - 1) * limit;
    
    const [services, total] = await Promise.all([
        Service.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email')
            .populate('productId', 'name'),
        Service.countDocuments(query),
    ]);
    
    return {
        services,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

export const updateServiceStatus = async (serviceId, status, reason, req) => {
    const service = await Service.findById(serviceId);
    if (!service) {
        throw new ApiError(404, 'Service not found');
    }
    
    const oldStatus = service.status;
    service.status = status;
    
    if (!service.history) service.history = [];
    service.history.push({
        date: new Date(),
        action: 'status_changed',
        description: `Status changed from ${oldStatus} to ${status}. Reason: ${reason || 'Admin action'}`,
        userId: req?.userId,
    });
    
    await service.save();
    
    await logAction({
        userId: service.userId,
        action: 'service.status_updated',
        metadata: { serviceId: service._id, oldStatus, newStatus: status, reason },
        req,
    });
    
    return service;
};

export const processRefund = async (invoiceId, refundData, req) => {
    const { amount, reason, refundToCredit = false } = refundData;
    const invoice = await Invoice.findById(invoiceId);
    
    if (!invoice) {
        throw new ApiError(404, 'Invoice not found');
    }
    
    if (invoice.status !== INVOICE_STATUS.PAID && invoice.status !== INVOICE_STATUS.PARTIAL) {
        throw new ApiError(400, 'Only paid or partially paid invoices can be refunded');
    }
    
    const maxRefund = invoice.amountPaid;
    if (amount > maxRefund) {
        throw new ApiError(400, `Refund amount exceeds amount paid (Max: ${maxRefund})`);
    }
    
    invoice.status = INVOICE_STATUS.REFUNDED;
    invoice.refundAmount = amount;
    invoice.refundedAt = new Date();
    
    if (!invoice.history) invoice.history = [];
    invoice.history.push({
        date: new Date(),
        action: 'refunded',
        description: `Refunded ${amount} via ${refundToCredit ? 'Credit' : 'Original Method'}. Reason: ${reason}`,
        userId: req?.userId,
    });
    
    if (refundToCredit) {
        const User = (await import('../../../models/User.js')).default;
        await User.findByIdAndUpdate(invoice.userId, {
            $inc: { creditBalance: amount }
        });
    }
    
    await invoice.save();
    
    await logAction({
        userId: invoice.userId,
        action: 'invoice.refunded',
        metadata: { invoiceId: invoice._id, amount, reason, toCredit: refundToCredit },
        req,
    });
    
    return invoice;
};

export const requestCancellation = async (serviceId, cancellationData, userId, req) => {
    const { type, reason } = cancellationData;
    const service = await Service.findOne({ _id: serviceId, userId });
    
    if (!service) {
        throw new ApiError(404, 'Service not found');
    }
    
    if (['cancelled', 'terminated'].includes(service.status)) {
        throw new ApiError(400, 'Service is already cancelled or terminated');
    }
    
    service.cancellationRequestedAt = new Date();
    service.cancellationType = type;
    service.cancellationReason = reason;
    
    if (!service.history) service.history = [];
    service.history.push({
        date: new Date(),
        action: 'cancellation_requested',
        description: `Cancellation requested (${type}). Reason: ${reason}`,
        userId,
    });
    
    await service.save();
    
    await logAction({
        userId,
        action: 'service.cancellation_requested',
        metadata: { serviceId: service._id, type, reason },
        req,
    });
    
    return service;
};