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
exports.updateSlidesOrder = exports.deleteHeroSlide = exports.updateHeroSlide = exports.getHeroSlideById = exports.getHeroSlides = exports.createHeroSlide = void 0;
const HeroService = __importStar(require("../services/hero.service"));
const createHeroSlide = async (req, res, next) => {
    try {
        const slide = await HeroService.createHeroSlide(req.body);
        res.status(201).json({
            success: true,
            message: "Hero slide created successfully",
            data: slide,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createHeroSlide = createHeroSlide;
const getHeroSlides = async (req, res, next) => {
    try {
        const includeInactive = req.query.includeInactive === "true";
        const slides = await HeroService.getHeroSlides(includeInactive);
        res.status(200).json({
            success: true,
            data: slides,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getHeroSlides = getHeroSlides;
const getHeroSlideById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const slide = await HeroService.getHeroSlideById(id);
        if (!slide) {
            return res.status(404).json({
                success: false,
                message: "Hero slide not found",
            });
        }
        res.status(200).json({
            success: true,
            data: slide,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getHeroSlideById = getHeroSlideById;
const updateHeroSlide = async (req, res, next) => {
    try {
        const { id } = req.params;
        const slide = await HeroService.updateHeroSlide(id, req.body);
        if (!slide) {
            return res.status(404).json({
                success: false,
                message: "Hero slide not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Hero slide updated successfully",
            data: slide,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateHeroSlide = updateHeroSlide;
const deleteHeroSlide = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await HeroService.deleteHeroSlide(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Hero slide not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Hero slide deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteHeroSlide = deleteHeroSlide;
/**
 * Update slides order (Admin only)
 */
const updateSlidesOrder = async (req, res, next) => {
    try {
        const { orders } = req.body;
        if (!Array.isArray(orders)) {
            return res.status(400).json({
                success: false,
                message: "Orders must be an array of { id, order }",
            });
        }
        await HeroService.updateSlidesOrder(orders);
        res.status(200).json({
            success: true,
            message: "Hero slides order updated successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSlidesOrder = updateSlidesOrder;
