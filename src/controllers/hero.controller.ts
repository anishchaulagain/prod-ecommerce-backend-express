import { Request, Response, NextFunction } from "express";
import * as HeroService from "../services/hero.service";
import { AuthRequest } from "../middlewares/auth.middleware";


export const createHeroSlide = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const slide = await HeroService.createHeroSlide(req.body);
    res.status(201).json({
      success: true,
      message: "Hero slide created successfully",
      data: slide,
    });
  } catch (error) {
    next(error);
  }
};

export const getHeroSlides = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const slides = await HeroService.getHeroSlides(includeInactive);
    res.status(200).json({
      success: true,
      data: slides,
    });
  } catch (error) {
    next(error);
  }
};

export const getHeroSlideById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const slide = await HeroService.getHeroSlideById(id as string);
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
  } catch (error) {
    next(error);
  }
};

export const updateHeroSlide = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const slide = await HeroService.updateHeroSlide(id as string, req.body);
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
  } catch (error) {
    next(error);
  }
};

export const deleteHeroSlide = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await HeroService.deleteHeroSlide(id as string);
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
  } catch (error) {
    next(error);
  }
};

/**
 * Update slides order (Admin only)
 */
export const updateSlidesOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
  } catch (error) {
    next(error);
  }
};
