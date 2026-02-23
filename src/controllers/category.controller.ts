import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as CategoryService from "../services/category.service";

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateCategorySchema = createCategorySchema.partial();

const querySchema = z.object({
  isActive: z.preprocess((v) => v === "true", z.boolean()).optional(),
  search: z.string().optional(),
  page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).default(20)),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Create category (Admin only)
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await CategoryService.createCategory(data);
    res.status(201).json({ message: "Category created successfully", category });
  } catch (error: any) {
    next(error);
  }
};

// Get all categories (Public)
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (error: any) {
    next(error);
  }
};

// Get single category by ID (Public)
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await CategoryService.getCategoryById(id as string);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error: any) {
    next(error);
  }
};

// Get single category by slug (Public)
export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const category = await CategoryService.getCategoryBySlug(slug as string);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error: any) {
    next(error);
  }
};

// Update category (Admin only)
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateCategorySchema.parse(req.body);

    const category = await CategoryService.updateCategory(id as string, data);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error: any) {
    next(error);
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category has associated products
    const productCount = await CategoryService.getCategoryProductCount(id as string);
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${productCount} associated product(s). Remove or reassign products first.`,
      });
    }

    const deleted = await CategoryService.deleteCategory(id as string);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error: any) {
    next(error);
  }
};
