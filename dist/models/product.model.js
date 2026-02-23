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
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    imageUrl: { type: String },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String },
    status: {
        type: String,
        enum: ["active", "inactive", "draft"],
        default: "draft"
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category"
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    // Additional fields
    tags: [{ type: String }],
    weight: { type: Number },
    dimensions: {
        length: { type: Number },
        width: { type: Number },
        height: { type: Number },
    },
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true });
// Index for efficient queries
ProductSchema.index({ status: 1, isDeleted: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ createdBy: 1 });
// Auto-generate slug from name if not provided
ProductSchema.pre("save", async function () {
    if (this.isModified("name") && !this.slug) {
        const timestamp = Date.now().toString(36);
        this.slug = `${this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")}-${timestamp}`;
    }
});
exports.default = mongoose_1.default.model("Product", ProductSchema);
