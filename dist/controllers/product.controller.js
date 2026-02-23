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
exports.hardDeleteProduct = exports.restoreProduct = exports.softDeleteProduct = exports.updateProduct = exports.getProductBySlug = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const zod_1 = require("zod");
const ProductService = __importStar(require("../services/product.service"));
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const zObjectId = zod_1.z.string().regex(objectIdRegex, "Invalid ID format");
const createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().url("Invalid image URL").optional().or(zod_1.z.literal("")),
    images: zod_1.z.array(zod_1.z.string().url("Invalid image URL")).optional(),
    price: zod_1.z.number().min(0, "Price must be positive"),
    discountPrice: zod_1.z.number().min(0, "Discount price must be positive").optional(),
    stockQuantity: zod_1.z.number().int("Stock quantity must be an integer").min(0, "Stock quantity cannot be negative").default(0),
    sku: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "inactive", "draft"], {
        message: "Status must be active, inactive, or draft",
    }).default("draft"),
    categoryId: zObjectId.optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    weight: zod_1.z.number().min(0, "Weight cannot be negative").optional(),
    dimensions: zod_1.z.object({
        length: zod_1.z.number().optional(),
        width: zod_1.z.number().optional(),
        height: zod_1.z.number().optional(),
    }).optional(),
    isFeatured: zod_1.z.boolean().default(false),
});
const updateProductSchema = createProductSchema.partial();
const querySchema = zod_1.z.object({
    status: zod_1.z.enum(["active", "inactive", "draft"]).optional(),
    categoryId: zod_1.z.string().optional(),
    isFeatured: zod_1.z.preprocess((v) => v === "true", zod_1.z.boolean()).optional(),
    search: zod_1.z.string().optional(),
    minPrice: zod_1.z.preprocess((v) => (v ? Number(v) : undefined), zod_1.z.number().optional()),
    maxPrice: zod_1.z.preprocess((v) => (v ? Number(v) : undefined), zod_1.z.number().optional()),
    includeDeleted: zod_1.z.preprocess((v) => v === "true", zod_1.z.boolean()).optional(),
    page: zod_1.z.preprocess((v) => (v ? Number(v) : 1), zod_1.z.number().int().min(1).default(1)),
    limit: zod_1.z.preprocess((v) => (v ? Number(v) : 20), zod_1.z.number().int().min(1).max(100).default(20)),
    sortBy: zod_1.z.string().default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
// Create product (Admin only)
const createProduct = async (req, res, next) => {
    try {
        const data = createProductSchema.parse(req.body);
        const adminId = req.user?.userId;
        if (!adminId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const product = await ProductService.createProduct(data, adminId);
        res.status(201).json({ message: "Product created successfully", product });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
// Get all products (Public)
const getProducts = async (req, res, next) => {
    try {
        const query = querySchema.parse(req.query);
        const { page, limit, sortBy, sortOrder, ...filters } = query;
        const result = await ProductService.getProducts(filters, {
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
exports.getProducts = getProducts;
// Get single product by ID (Public)
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await ProductService.getProductById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
// Get single product by slug (Public)
const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await ProductService.getProductBySlug(slug);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductBySlug = getProductBySlug;
// Update product (Admin only)
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = updateProductSchema.parse(req.body);
        const product = await ProductService.updateProduct(id, data);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully", product });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
// Soft delete product (Admin only)
const softDeleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await ProductService.softDeleteProduct(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.softDeleteProduct = softDeleteProduct;
// Restore soft-deleted product (Admin only)
const restoreProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await ProductService.restoreProduct(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product restored successfully", product });
    }
    catch (error) {
        next(error);
    }
};
exports.restoreProduct = restoreProduct;
// Hard delete product (Admin only - permanent)
const hardDeleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await ProductService.hardDeleteProduct(id);
        if (!deleted) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product permanently deleted" });
    }
    catch (error) {
        next(error);
    }
};
exports.hardDeleteProduct = hardDeleteProduct;
