import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as CartService from "../services/cart.service";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const zObjectId = z.string().regex(objectIdRegex, "Invalid ID format");

const addItemSchema = z.object({
  productId: zObjectId,
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .default(1),
});

const updateItemSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
});

// Get current user's cart
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cart = await CartService.getCart(userId);
    res.status(200).json(cart);
  } catch (error: any) {
    next(error);
  }
};

// Add item to cart
export const addItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { productId, quantity } = addItemSchema.parse(req.body);
    const cart = await CartService.addItem(userId, productId, quantity);

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error: any) {
    next(error);
  }
};

// Update item quantity
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const itemId = req.params.itemId as string;
    const { quantity } = updateItemSchema.parse(req.body);
    const cart = await CartService.updateItemQuantity(userId, itemId, quantity);

    if (!cart) {
      return res.status(404).json({ message: "Cart or item not found" });
    }

    res.status(200).json({ message: "Cart item updated", cart });
  } catch (error: any) {
    next(error);
  }
};

// Remove item from cart
export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const itemId = req.params.itemId as string;
    const cart = await CartService.removeItem(userId, itemId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error: any) {
    next(error);
  }
};
