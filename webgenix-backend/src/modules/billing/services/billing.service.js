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
    
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product || product.status !== 'active') {
            throw new ApiError(400, `Product ${item.productId} is not available`);
        }
        
        // Get pricing for the selected cycle
        const pricing = product.pricing.find(p => p.cycle === item.cycle && p.isActive);
        if (!pricing) {
            throw new ApiError(400, `Pricing for cycle ${item.cycle} not available`);
        }
        
        const itemTotal = pricing.price + (pricing.setupFee || 0);
        
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
        
        // Add addon prices
        if (item.addons?.length > 0) {
            for (const addon of item.addons) {
                subtotal += addon.price;
                orderItems[orderItems.length - 1].total += addon.price;
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

export const markInvoiceAsPaid = async (invoiceId, paymentData, req) => {
    console.log('[BillingService] markInvoiceAsPaid called:', { invoiceId, paymentMethod: paymentData.paymentMethod });
    
    // NOTE: No transactions — local MongoDB standalone does not support them.
    // Operations are sequential. If a step fails, the error is logged and re-thrown.
    
    console.log('[BillingService] Finding invoice:', invoiceId);
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        throw new ApiError(404, 'Invoice not found');
    }
    
    console.log('[BillingService] Invoice found, current status:', invoice.status);
    
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
        await Order.findByIdAndUpdate(invoice.orderId, {
            status: ORDER_STATUS.COMPLETED,
            paymentStatus: 'paid',
        });
        
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
    const order = await Order.findById(orderId);
    if (!order) return;
    
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

export const cancelOrder = async (orderId, userId, reason, req) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const order = await Order.findById(orderId).session(session);
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
        
        await order.save({ session });
        
        // Cancel associated invoice if exists
        if (order.invoiceId) {
            await Invoice.findByIdAndUpdate(order.invoiceId, {
                status: INVOICE_STATUS.CANCELLED,
            }, { session });
        }
        
        await session.commitTransaction();
        
        await logAction({
            userId,
            action: 'order.cancelled',
            metadata: { orderId: order._id, reason },
            req,
        });
        
        return order;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
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