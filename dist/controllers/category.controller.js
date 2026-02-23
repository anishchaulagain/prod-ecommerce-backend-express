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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const zod_1 = require("zod");
const CategoryService = __importStar(require("../services/category.service"));
// Validation schemas
const createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
});
const updateCategorySchema = createCategorySchema.partial();
const querySchema = zod_1.z.object({
    isActive: zod_1.z.preprocess((v) => v === "true", zod_1.z.boolean()).optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.preprocess((v) => (v ? Number(v) : 1), zod_1.z.number().int().min(1).default(1)),
    limit: zod_1.z.preprocess((v) => (v ? Number(v) : 20), zod_1.z.number().int().min(1).max(100).default(20)),
    sortBy: zod_1.z.string().default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
// Create category (Admin only)
const createCategory = async (req, res, next) => {
    try {
        const data = createCategorySchema.parse(req.body);
        const category = await CategoryService.createCategory(data);
        res.status(201).json({ message: "Category created successfully", category });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
// Get all categories (Public)
const getCategories = async (req, res, next) => {
    try {
        const query = querySchema.parse(req.query);
        const { page, limit, sortBy, sortOrder, ...filters } = query;
        const result = await CategoryService.getCategories(filters, {
            page,
            limit,
            sortBy,
            sortOrder,
        });
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
// Get single category by ID (Public)
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await CategoryService.getCategoryById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryById = getCategoryById;
// Get single category by slug (Public)
const getCategoryBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const category = await CategoryService.getCategoryBySlug(slug);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
// Update category (Admin only)
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = updateCategorySchema.parse(req.body);
        const category = await CategoryService.updateCategory(id, data);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category updated successfully", category });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
// Delete category (Admin only)
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if category has associated products
        const productCount = await CategoryService.getCategoryProductCount(id);
        if (productCount > 0) {
            return res.status(400).json({
                message: `Cannot delete category. It has ${productCount} associated product(s). Remove or reassign products first.`,
            });
        }
        const deleted = await CategoryService.deleteCategory(id);
        if (!deleted) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
