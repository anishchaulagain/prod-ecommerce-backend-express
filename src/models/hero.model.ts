import { Document, model, Schema } from "mongoose";

export interface HeroSlideDocument extends Document{
     title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const heroSlideSchema = new Schema<HeroSlideDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    mobileImageUrl: {
      type: String,
    },

    ctaText: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    ctaLink: {
      type: String,
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
      index: true, 
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HeroSlide = model<HeroSlideDocument>(
  "HeroSlide",
  heroSlideSchema
);