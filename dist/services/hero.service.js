"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSlidesOrder = exports.deleteHeroSlide = exports.updateHeroSlide = exports.getHeroSlideById = exports.getHeroSlides = exports.createHeroSlide = exports.updateHeroSlideSchema = exports.heroSlideSchema = void 0;
const zod_1 = require("zod");
const hero_model_1 = require("../models/hero.model");
// Zod schemas for validation
exports.heroSlideSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(100, "Title is too long"),
    subtitle: zod_1.z.string().max(300, "Subtitle is too long").optional(),
    imageUrl: zod_1.z.string().url("Invalid image URL"),
    mobileImageUrl: zod_1.z.string().url("Invalid mobile image URL").optional().or(zod_1.z.literal("")),
    ctaText: zod_1.z.string().max(30, "CTA text is too long").optional(),
    ctaLink: zod_1.z.string().optional(),
    order: zod_1.z.number().int().default(0),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateHeroSlideSchema = exports.heroSlideSchema.partial();
const createHeroSlide = async (data) => {
    const validatedData = exports.heroSlideSchema.parse(data);
    const heroSlide = new hero_model_1.HeroSlide(validatedData);
    return await heroSlide.save();
};
exports.createHeroSlide = createHeroSlide;
const getHeroSlides = async (includeInactive = false) => {
    const query = includeInactive ? {} : { isActive: true };
    return await hero_model_1.HeroSlide.find(query).sort({ order: 1, createdAt: -1 });
};
exports.getHeroSlides = getHeroSlides;
const getHeroSlideById = async (id) => {
    return await hero_model_1.HeroSlide.findById(id);
};
exports.getHeroSlideById = getHeroSlideById;
const updateHeroSlide = async (id, data) => {
    const validatedData = exports.updateHeroSlideSchema.parse(data);
    return await hero_model_1.HeroSlide.findByIdAndUpdate(id, { $set: validatedData }, { new: true, runValidators: true });
};
exports.updateHeroSlide = updateHeroSlide;
const deleteHeroSlide = async (id) => {
    const result = await hero_model_1.HeroSlide.findByIdAndDelete(id);
    return !!result;
};
exports.deleteHeroSlide = deleteHeroSlide;
const updateSlidesOrder = async (orders) => {
    const bulkOps = orders.map((item) => ({
        updateOne: {
            filter: { _id: item.id },
            update: { $set: { order: item.order } },
        },
    }));
    if (bulkOps.length > 0) {
        await hero_model_1.HeroSlide.bulkWrite(bulkOps);
    }
};
exports.updateSlidesOrder = updateSlidesOrder;
