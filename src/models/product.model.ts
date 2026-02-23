import mongoose, { Document, Schema, Types } from "mongoose";

export type ProductStatus = "active" | "inactive" | "draft";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku?: string;
  status: ProductStatus;
  categoryId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  // Additional production fields
  tags?: string[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
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
      type: Schema.Types.ObjectId, 
      ref: "Category" 
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
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
  },
  { timestamps: true }
);

// Index for efficient queries
ProductSchema.index({ status: 1, isDeleted: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ createdBy: 1 });

// Auto-generate slug from name if not provided
ProductSchema.pre("save", async function (this: IProduct) {
  if (this.isModified("name") && !this.slug) {
    const timestamp = Date.now().toString(36);
    this.slug = `${this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${timestamp}`;
  }
});

export default mongoose.model<IProduct>("Product", ProductSchema);
