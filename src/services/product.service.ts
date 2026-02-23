import Product, { IProduct, ProductStatus } from "../models/product.model";
import { Types } from "mongoose";

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku?: string;
  status?: ProductStatus;
  categoryId?: string;
  tags?: string[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  isFeatured?: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface ProductFilters {
  status?: ProductStatus;
  categoryId?: string;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  includeDeleted?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Create product
export const createProduct = async (
  data: CreateProductInput,
  adminId: string
): Promise<IProduct> => {
  const product = await Product.create({
    ...data,
    categoryId: data.categoryId ? new Types.ObjectId(data.categoryId) : undefined,
    createdBy: new Types.ObjectId(adminId),
  });
  return product;
};

// Get all products with filters and pagination
export const getProducts = async (
  filters: ProductFilters = {},
  pagination: PaginationOptions = {}
) => {
  const {
    status,
    categoryId,
    isFeatured,
    search,
    minPrice,
    maxPrice,
    includeDeleted = false,
  } = filters;

  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = pagination;

  const query: any = {};

  // Default: exclude soft-deleted products
  if (!includeDeleted) {
    query.isDeleted = false;
  }

  if (status) query.status = status;
  if (categoryId) query.categoryId = new Types.ObjectId(categoryId);
  if (isFeatured !== undefined) query.isFeatured = isFeatured;
  if (minPrice !== undefined) query.price = { ...query.price, $gte: minPrice };
  if (maxPrice !== undefined) query.price = { ...query.price, $lte: maxPrice };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("categoryId", "name slug")
      .populate("createdBy", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
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

// Get single product by ID
export const getProductById = async (id: string): Promise<IProduct | null> => {
  return Product.findOne({ _id: id, isDeleted: false })
    .populate("categoryId", "name slug")
    .populate("createdBy", "name email");
};

// Get single product by slug
export const getProductBySlug = async (slug: string): Promise<IProduct | null> => {
  return Product.findOne({ slug, isDeleted: false })
    .populate("categoryId", "name slug")
    .populate("createdBy", "name email");
};

// Update product
export const updateProduct = async (
  id: string,
  data: UpdateProductInput
): Promise<IProduct | null> => {
  const updateData: any = { ...data };
  
  if (data.categoryId) {
    updateData.categoryId = new Types.ObjectId(data.categoryId);
  }

  return Product.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate("categoryId", "name slug")
    .populate("createdBy", "name email");
};

// Soft delete product
export const softDeleteProduct = async (id: string): Promise<IProduct | null> => {
  return Product.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );
};

// Restore soft-deleted product
export const restoreProduct = async (id: string): Promise<IProduct | null> => {
  return Product.findByIdAndUpdate(
    id,
    { $set: { isDeleted: false, deletedAt: null } },
    { new: true }
  );
};

// Hard delete product (permanent)
export const hardDeleteProduct = async (id: string): Promise<boolean> => {
  const result = await Product.findByIdAndDelete(id);
  return !!result;
};
