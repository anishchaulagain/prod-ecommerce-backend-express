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
exports.removeItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const zod_1 = require("zod");
const CartService = __importStar(require("../services/cart.service"));
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const zObjectId = zod_1.z.string().regex(objectIdRegex, "Invalid ID format");
const addItemSchema = zod_1.z.object({
    productId: zObjectId,
    quantity: zod_1.z
        .number()
        .int("Quantity must be an integer")
        .min(1, "Quantity must be at least 1")
        .default(1),
});
const updateItemSchema = zod_1.z.object({
    quantity: zod_1.z
        .number()
        .int("Quantity must be an integer")
        .min(1, "Quantity must be at least 1"),
});
// Get current user's cart
const getCart = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const cart = await CartService.getCart(userId);
        res.status(200).json(cart);
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
// Add item to cart
const addItem = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { productId, quantity } = addItemSchema.parse(req.body);
        const cart = await CartService.addItem(userId, productId, quantity);
        res.status(200).json({ message: "Item added to cart", cart });
    }
    catch (error) {
        next(error);
    }
};
exports.addItem = addItem;
// Update item quantity
const updateItem = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const itemId = req.params.itemId;
        const { quantity } = updateItemSchema.parse(req.body);
        const cart = await CartService.updateItemQuantity(userId, itemId, quantity);
        if (!cart) {
            return res.status(404).json({ message: "Cart or item not found" });
        }
        res.status(200).json({ message: "Cart item updated", cart });
    }
    catch (error) {
        next(error);
    }
};
exports.updateItem = updateItem;
// Remove item from cart
const removeItem = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const itemId = req.params.itemId;
        const cart = await CartService.removeItem(userId, itemId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        res.status(200).json({ message: "Item removed from cart", cart });
    }
    catch (error) {
        next(error);
    }
};
exports.removeItem = removeItem;
