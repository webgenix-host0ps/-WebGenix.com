import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * KnowledgebaseArticle model — stores self-service help content.
 */
const knowledgebaseArticleSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Article title is required'],
        trim: true,
    },
    slug: {
        type: String,
        required: [true, 'Article slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    content: {
        type: String,
        required: [true, 'Article content is required'], // Markdown or HTML
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'KnowledgebaseCategory',
        required: [true, 'Category is required'],
        index: true,
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published',
        index: true,
    },
    isPublic: {
        type: Boolean,
        default: true, // If false, only logged-in clients can see
    },
    views: {
        type: Number,
        default: 0,
    },
    tags: [{
        type: String,
        trim: true,
    }],
}, {
    timestamps: true,
});

export default mongoose.model('KnowledgebaseArticle', knowledgebaseArticleSchema);
