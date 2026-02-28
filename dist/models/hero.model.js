"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroSlide = void 0;
const mongoose_1 = require("mongoose");
const heroSlideSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
exports.HeroSlide = (0, mongoose_1.model)("HeroSlide", heroSlideSchema);
