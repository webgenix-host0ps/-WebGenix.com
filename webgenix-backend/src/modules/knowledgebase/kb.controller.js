import KnowledgebaseArticle from './models/KnowledgebaseArticle.js';
import KnowledgebaseCategory from './models/KnowledgebaseCategory.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// --- Category Controllers ---

export const getCategories = asyncHandler(async (req, res) => {
    const categories = await KnowledgebaseCategory.find().sort({ order: 1 });
    res.status(200).json(new ApiResponse(200, categories, 'KB categories retrieved successfully'));
});

export const createCategory = asyncHandler(async (req, res) => {
    const category = await KnowledgebaseCategory.create(req.body);
    res.status(201).json(new ApiResponse(201, category, 'KB category created successfully'));
});

// --- Article Controllers ---

export const getArticles = asyncHandler(async (req, res) => {
    const { categoryId, status, search } = req.query;
    const query = {};
    if (categoryId) query.categoryId = categoryId;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const articles = await KnowledgebaseArticle.find(query).populate('categoryId', 'name').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, articles, 'KB articles retrieved successfully'));
});

export const createArticle = asyncHandler(async (req, res) => {
    const article = await KnowledgebaseArticle.create({ ...req.body, authorId: req.user._id });
    res.status(201).json(new ApiResponse(201, article, 'KB article created successfully'));
});

export const getArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await KnowledgebaseArticle.findById(id).populate('categoryId', 'name');
    if (!article) throw new ApiError(404, 'Article not found');

    article.viewCount = (article.viewCount || 0) + 1;
    await article.save();

    res.status(200).json(new ApiResponse(200, article, 'KB article retrieved successfully'));
});

export const updateArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await KnowledgebaseArticle.findByIdAndUpdate(id, req.body, { new: true });
    if (!article) throw new ApiError(404, 'Article not found');
    res.status(200).json(new ApiResponse(200, article, 'KB article updated successfully'));
});

export const searchArticles = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(200).json(new ApiResponse(200, [], 'No search query provided'));
    }
    const articles = await KnowledgebaseArticle.find({
        $or: [
            { title: { $regex: q, $options: 'i' } },
            { content: { $regex: q, $options: 'i' } },
        ],
        status: 'published'
    }).populate('categoryId', 'name').sort({ viewCount: -1 }).limit(20);
    res.status(200).json(new ApiResponse(200, articles, 'KB search results'));
});
