import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * EmailTemplate model — manages customizable HTML email templates.
 */
const emailTemplateSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Template name is required'],
        trim: true,
    },
    type: {
        type: String,
        required: [true, 'Template trigger type is required'],
        unique: true, // e.g. 'welcome_email', 'invoice_created', 'invoice_overdue'
        index: true,
    },
    subject: {
        type: String,
        required: [true, 'Email subject is required'],
        trim: true,
    },
    htmlBody: {
        type: String,
        required: [true, 'HTML body is required'],
    },
    textBody: {
        type: String, // Fallback plain text version
    },
    variables: [{
        type: String, // Available merge fields e.g., '{{client.name}}', '{{invoice.total}}'
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model('EmailTemplate', emailTemplateSchema);
