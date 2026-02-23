"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardDeleteProduct = exports.restoreProduct = exports.softDeleteProduct = exports.updateProduct = exports.getProductBySlug = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const mongoose_1 = require("mongoose");
// Create product
const createProduct = async (data, adminId) => {
    const product = await product_model_1.default.create({
        ...data,
        categoryId: data.categoryId ? new mongoose_1.Types.ObjectId(data.categoryId) : undefined,
        createdBy: new mongoose_1.Types.ObjectId(adminId),
    });
    return product;
};
exports.createProduct = createProduct;
// Get all products with filters and pagination
const getProducts = async (filters = {}, pagination = {}) => {
    const { status, categoryId, isFeatured, search, minPrice, maxPrice, includeDeleted = false, } = filters;
    const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", } = pagination;
    const query = {};
    // Default: exclude soft-deleted products
    if (!includeDeleted) {
        query.isDeleted = false;
    }
    if (status)
        query.status = status;
    if (categoryId)
        query.categoryId = new mongoose_1.Types.ObjectId(categoryId);
    if (isFeatured !== undefined)
        query.isFeatured = isFeatured;
    if (minPrice !== undefined)
        query.price = { ...query.price, $gte: minPrice };
    if (maxPrice !== undefined)
        query.price = { ...query.price, $lte: maxPrice };
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { tags: { $in: [new RegExp(search, "i")] } },
        ];
    }
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    const [products, total] = await Promise.all([
        product_model_1.default.find(query)
            .populate("categoryId", "name slug")
            .populate("createdBy", "name email")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit),
        product_model_1.default.countDocuments(query),
    ]);
    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getProducts = getProducts;
// Get single product by ID
const getProductById = async (id) => {
    return product_model_1.default.findOne({ _id: id, isDeleted: false })
        .populate("categoryId", "name slug")
        .populate("createdBy", "name email");
};
exports.getProductById = getProductById;
// Get single product by slug
const getProductBySlug = async (slug) => {
    return product_model_1.default.findOne({ slug, isDeleted: false })
        .populate("categoryId", "name slug")
        .populate("createdBy", "name email");
};
exports.getProductBySlug = getProductBySlug;
// Update product
const updateProduct = async (id, data) => {
    const updateData = { ...data };
    if (data.categoryId) {
        updateData.categoryId = new mongoose_1.Types.ObjectId(data.categoryId);
    }
    return product_model_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
        .populate("categoryId", "name slug")
        .populate("createdBy", "name email");
};
exports.updateProduct = updateProduct;
// Soft delete product
const softDeleteProduct = async (id) => {
    return product_model_1.default.findByIdAndUpdate(id, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true });
};
exports.softDeleteProduct = softDeleteProduct;
// Restore soft-deleted product
const restoreProduct = async (id) => {
    return product_model_1.default.findByIdAndUpdate(id, { $set: { isDeleted: false, deletedAt: null } }, { new: true });
};
exports.restoreProduct = restoreProduct;
// Hard delete product (permanent)
const hardDeleteProduct = async (id) => {
    const result = await product_model_1.default.findByIdAndDelete(id);
    return !!result;
};
exports.hardDeleteProduct = hardDeleteProduct;
