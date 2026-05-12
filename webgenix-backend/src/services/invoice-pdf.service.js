import PDFDocument from 'pdfkit';
import Invoice from '../modules/billing/models/Invoice.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const generateInvoicePDF = async (invoiceId, userId) => {
    const invoice = await Invoice.findById(invoiceId).populate('userId', 'name email phone clientProfile');
    if (!invoice) throw new ApiError(404, 'Invoice not found');

    if (userId && invoice.userId._id.toString() !== userId.toString()) {
        const user = await User.findById(userId);
        if (!user || (user.role !== 'admin' && user.role !== 'billing')) {
            throw new ApiError(403, 'Access denied');
        }
    }

    const client = invoice.userId;
    const doc = new PDFDocument({ margin: 50 });

    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const font = 'Helvetica';
        const bold = 'Helvetica-Bold';

        // Header
        doc.fontSize(24).font(bold).text('INVOICE', 50, 50);
        doc.fontSize(10).font(font).fillColor('#666')
            .text(`Invoice #: ${invoice.invoiceNumber}`, 50, 80)
            .text(`Status: ${invoice.status.toUpperCase()}`, 50, 95)
            .text(`Date Issued: ${invoice.dateIssued ? new Date(invoice.dateIssued).toLocaleDateString() : 'N/A'}`, 50, 110)
            .text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, 50, 125);

        // Company info (right side)
        const rightX = 400;
        doc.font(bold).text('WebGenix', rightX, 80);
        doc.font(font).fillColor('#333')
            .text('support@webgenix.com', rightX, 95)
            .text('+91-XXXXXXXXXX', rightX, 110);

        // Divider
        doc.moveTo(50, 150).lineTo(545, 150).strokeColor('#ddd').stroke();

        // Bill To
        const billToY = 170;
        doc.fontSize(12).font(bold).fillColor('#000').text('Bill To:', 50, billToY);
        doc.fontSize(10).font(font).fillColor('#333')
            .text(client.name || 'N/A', 50, billToY + 18)
            .text(client.email || '', 50, billToY + 33);

        if (client.clientProfile?.company) {
            doc.text(client.clientProfile.company, 50, billToY + 48);
        }

        if (client.clientProfile?.billingAddress) {
            const addr = client.clientProfile.billingAddress;
            const addrLines = [addr.line1, addr.line2, `${addr.city || ''} ${addr.state || ''} ${addr.pincode || ''}`].filter(Boolean);
            addrLines.forEach((line, i) => {
                doc.text(line, 50, billToY + 63 + i * 15);
            });
        }

        // Items Table Header
        const tableTop = 280;
        doc.rect(50, tableTop, 495, 20).fillColor('#f5f5f5').fill();
        doc.fillColor('#000').font(bold).fontSize(9);
        doc.text('Description', 60, tableTop + 5, { width: 260 });
        doc.text('Qty', 330, tableTop + 5, { width: 40, align: 'center' });
        doc.text('Rate', 380, tableTop + 5, { width: 70, align: 'right' });
        doc.text('Total', 470, tableTop + 5, { width: 70, align: 'right' });

        // Table Rows
        let y = tableTop + 25;
        doc.font(font).fontSize(9);
        invoice.items.forEach((item, i) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            doc.fillColor('#333');
            doc.text(item.description || 'Item', 60, y, { width: 260 });
            doc.text(String(item.quantity || 1), 330, y, { width: 40, align: 'center' });
            doc.text(formatCurrency(item.unitPrice || 0, invoice.currency), 380, y, { width: 70, align: 'right' });
            doc.text(formatCurrency(item.total || 0, invoice.currency), 470, y, { width: 70, align: 'right' });

            y += 20;
        });

        // Totals
        y += 10;
        doc.moveTo(350, y).lineTo(545, y).strokeColor('#ddd').stroke();
        y += 15;

        doc.font(font).fontSize(10);
        const labelX = 350;
        const valueX = 470;

        const addTotalRow = (label, value, boldRow = false) => {
            if (boldRow) doc.font(bold); else doc.font(font);
            doc.fillColor('#333').text(label, labelX, y, { width: 110 });
            doc.text(value, valueX, y, { width: 70, align: 'right' });
            y += 18;
        };

        addTotalRow('Subtotal:', formatCurrency(invoice.subtotal, invoice.currency));
        if (invoice.discount > 0) {
            addTotalRow('Discount:', `-${formatCurrency(invoice.discount, invoice.currency)}`);
        }
        if (invoice.tax > 0) {
            addTotalRow(`${invoice.taxName || 'Tax'} (${invoice.taxRate}%):`, formatCurrency(invoice.tax, invoice.currency));
        }
        doc.moveTo(350, y).lineTo(545, y).strokeColor('#ddd').stroke();
        y += 5;
        addTotalRow('Total:', formatCurrency(invoice.total, invoice.currency), true);
        if (invoice.creditApplied > 0) {
            addTotalRow('Credit Applied:', `-${formatCurrency(invoice.creditApplied, invoice.currency)}`);
            doc.moveTo(350, y).lineTo(545, y).strokeColor('#ddd').stroke();
            y += 5;
            addTotalRow('Amount Due:', formatCurrency(invoice.amountDue, invoice.currency), true);
        }

        // Footer
        const footerY = Math.max(y + 40, 700);
        doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#ddd').stroke();
        doc.fontSize(8).fillColor('#999').font(font)
            .text('Thank you for your business!', 50, footerY + 10, { align: 'center' })
            .text('WebGenix - support@webgenix.com', 50, footerY + 22, { align: 'center' });

        doc.end();
    });
};

function formatCurrency(amount, currency = 'INR') {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || currency + ' ';
    return symbol + (amount || 0).toFixed(2);
}
