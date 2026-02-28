import { z } from "zod";
import { HeroSlide, HeroSlideDocument } from "../models/hero.model";

// Zod schemas for validation
export const heroSlideSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  subtitle: z.string().max(300, "Subtitle is too long").optional(),
  imageUrl: z.string().url("Invalid image URL"),
  mobileImageUrl: z.string().url("Invalid mobile image URL").optional().or(z.literal("")),
  ctaText: z.string().max(30, "CTA text is too long").optional(),
  ctaLink: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateHeroSlideSchema = heroSlideSchema.partial();

export type CreateHeroSlideInput = z.infer<typeof heroSlideSchema>;
export type UpdateHeroSlideInput = z.infer<typeof updateHeroSlideSchema>;

export const createHeroSlide = async (data: CreateHeroSlideInput): Promise<HeroSlideDocument> => {
  const validatedData = heroSlideSchema.parse(data);
  const heroSlide = new HeroSlide(validatedData);
  return await heroSlide.save();
};

export const getHeroSlides = async (includeInactive = false): Promise<HeroSlideDocument[]> => {
  const query = includeInactive ? {} : { isActive: true };
  return await HeroSlide.find(query).sort({ order: 1, createdAt: -1 });
};

export const getHeroSlideById = async (id: string): Promise<HeroSlideDocument | null> => {
  return await HeroSlide.findById(id);
};

export const updateHeroSlide = async (
  id: string,
  data: UpdateHeroSlideInput
): Promise<HeroSlideDocument | null> => {
  const validatedData = updateHeroSlideSchema.parse(data);
  return await HeroSlide.findByIdAndUpdate(
    id,
    { $set: validatedData },
    { new: true, runValidators: true }
  );
};

export const deleteHeroSlide = async (id: string): Promise<boolean> => {
  const result = await HeroSlide.findByIdAndDelete(id);
  return !!result;
};

export const updateSlidesOrder = async (orders: { id: string; order: number }[]): Promise<void> => {
  const bulkOps = orders.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { order: item.order } },
    },
  }));

  if (bulkOps.length > 0) {
    await HeroSlide.bulkWrite(bulkOps);
  }
};
