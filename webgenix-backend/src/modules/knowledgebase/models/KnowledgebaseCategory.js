import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * KnowledgebaseCategory model — organizes KB articles into hierarchical topics.
 */
const knowledgebaseCategorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
    },
    slug: {
        type: String,
        required: [true, 'Category slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        trim: true,
    },
    icon: {
        type: String, // e.g. FontAwesome class or icon name
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'KnowledgebaseCategory',
        default: null, // null means it's a top-level category
    },
    order: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model('KnowledgebaseCategory', knowledgebaseCategorySchema);
