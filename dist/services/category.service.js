"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryProductCount = exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
// Create category
const createCategory = async (data) => {
    const category = await category_model_1.default.create(data);
    return category;
};
exports.createCategory = createCategory;
// Get all categories with filters and pagination
const getCategories = async (filters = {}, pagination = {}) => {
    const { isActive, search } = filters;
    const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", } = pagination;
    const query = {};
    if (isActive !== undefined)
        query.isActive = isActive;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    const [categories, total] = await Promise.all([
        category_model_1.default.find(query).sort(sortOptions).skip(skip).limit(limit),
        category_model_1.default.countDocuments(query),
    ]);
    return {
        categories,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getCategories = getCategories;
// Get single category by ID
const getCategoryById = async (id) => {
    return category_model_1.default.findById(id);
};
exports.getCategoryById = getCategoryById;
// Get single category by slug
const getCategoryBySlug = async (slug) => {
    return category_model_1.default.findOne({ slug });
};
exports.getCategoryBySlug = getCategoryBySlug;
// Update category
const updateCategory = async (id, data) => {
    return category_model_1.default.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
};
exports.updateCategory = updateCategory;
// Delete category
const deleteCategory = async (id) => {
    const result = await category_model_1.default.findByIdAndDelete(id);
    return !!result;
};
exports.deleteCategory = deleteCategory;
// Check if category has products (for safe deletion)
const getCategoryProductCount = async (categoryId) => {
    // Import Product model dynamically to avoid circular dependency
    const Product = (await Promise.resolve().then(() => __importStar(require("../models/product.model")))).default;
    return Product.countDocuments({ categoryId, isDeleted: false });
};
exports.getCategoryProductCount = getCategoryProductCount;
