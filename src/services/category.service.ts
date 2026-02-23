import Category, { ICategory } from "../models/category.model";

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export interface CategoryFilters {
  isActive?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Create category
export const createCategory = async (
  data: CreateCategoryInput
): Promise<ICategory> => {
  const category = await Category.create(data);
  return category;
};

// Get all categories with filters and pagination
export const getCategories = async (
  filters: CategoryFilters = {},
  pagination: PaginationOptions = {}
) => {
  const { isActive, search } = filters;

  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = pagination;

  const query: any = {};

  if (isActive !== undefined) query.isActive = isActive;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [categories, total] = await Promise.all([
    Category.find(query).sort(sortOptions).skip(skip).limit(limit),
    Category.countDocuments(query),
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

// Get single category by ID
export const getCategoryById = async (
  id: string
): Promise<ICategory | null> => {
  return Category.findById(id);
};

// Get single category by slug
export const getCategoryBySlug = async (
  slug: string
): Promise<ICategory | null> => {
  return Category.findOne({ slug });
};

// Update category
export const updateCategory = async (
  id: string,
  data: UpdateCategoryInput
): Promise<ICategory | null> => {
  return Category.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
};

// Delete category
export const deleteCategory = async (id: string): Promise<boolean> => {
  const result = await Category.findByIdAndDelete(id);
  return !!result;
};

// Check if category has products (for safe deletion)
export const getCategoryProductCount = async (categoryId: string): Promise<number> => {
  // Import Product model dynamically to avoid circular dependency
  const Product = (await import("../models/product.model")).default;
  return Product.countDocuments({ categoryId, isDeleted: false });
};
