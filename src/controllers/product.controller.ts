import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as ProductService from "../services/product.service";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const zObjectId = z.string().regex(objectIdRegex, "Invalid ID format");
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  price: z.number().min(0, "Price must be positive"),
  discountPrice: z.number().min(0, "Discount price must be positive").optional(),
  stockQuantity: z.number().int("Stock quantity must be an integer").min(0, "Stock quantity cannot be negative").default(0),
  sku: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"], {
    message: "Status must be active, inactive, or draft",
  }).default("draft"),
  categoryId: zObjectId.optional(),
  tags: z.array(z.string()).optional(),
  weight: z.number().min(0, "Weight cannot be negative").optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  isFeatured: z.boolean().default(false),
});

const updateProductSchema = createProductSchema.partial();

const querySchema = z.object({
  status: z.enum(["active", "inactive", "draft"]).optional(),
  categoryId: z.string().optional(),
  isFeatured: z.preprocess((v) => v === "true", z.boolean()).optional(),
  search: z.string().optional(),
  minPrice: z.preprocess((v) => (v ? Number(v) : undefined), z.number().optional()),
  maxPrice: z.preprocess((v) => (v ? Number(v) : undefined), z.number().optional()),
  includeDeleted: z.preprocess((v) => v === "true", z.boolean()).optional(),
  page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Create product (Admin only)
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createProductSchema.parse(req.body);
    const adminId = (req as any).user?.userId;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const product = await ProductService.createProduct(data, adminId);
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error: any) {
    next(error);
  }
};

// Get all products (Public)
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (error: any) {
    next(error);
  }
};

// Get single product by ID (Public)
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(id as string);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error: any) {
    next(error);
  }
};

// Get single product by slug (Public)
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const product = await ProductService.getProductBySlug(slug as string);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error: any) {
    next(error);
  }
};

// Update product (Admin only)
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateProductSchema.parse(req.body);

    const product = await ProductService.updateProduct(id as string, data);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error: any) {
    next(error);
  }
};

// Soft delete product (Admin only)
export const softDeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await ProductService.softDeleteProduct(id as string);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error: any) {
    next(error);
  }
};

// Restore soft-deleted product (Admin only)
export const restoreProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await ProductService.restoreProduct(id as string);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product restored successfully", product });
  } catch (error: any) {
    next(error);
  }
};

// Hard delete product (Admin only - permanent)
export const hardDeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await ProductService.hardDeleteProduct(id as string);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product permanently deleted" });
  } catch (error: any) {
    next(error);
  }
};
