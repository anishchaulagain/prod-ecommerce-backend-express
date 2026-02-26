"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeItem = exports.updateItemQuantity = exports.addItem = exports.getCart = void 0;
const cart_model_1 = __importDefault(require("../models/cart.model"));
const mongoose_1 = require("mongoose");
// Get cart for user (creates empty cart if none exists)
const getCart = async (userId) => {
    let cart = await cart_model_1.default.findOne({ userId: new mongoose_1.Types.ObjectId(userId) }).populate("items.productId", "name slug imageUrl price discountPrice stockQuantity status");
    if (!cart) {
        cart = await cart_model_1.default.create({ userId: new mongoose_1.Types.ObjectId(userId), items: [] });
    }
    return cart;
};
exports.getCart = getCart;
// Add item to cart (increments quantity if product already exists)
const addItem = async (userId, productId, quantity) => {
    let cart = await cart_model_1.default.findOne({ userId: new mongoose_1.Types.ObjectId(userId) });
    if (!cart) {
        cart = await cart_model_1.default.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            items: [{ productId: new mongoose_1.Types.ObjectId(productId), quantity }],
        });
    }
    else {
        const existingItem = cart.items.find((item) => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        }
        else {
            cart.items.push({
                productId: new mongoose_1.Types.ObjectId(productId),
                quantity,
            });
        }
        await cart.save();
    }
    return cart_model_1.default.findById(cart._id).populate("items.productId", "name slug imageUrl price discountPrice stockQuantity status");
};
exports.addItem = addItem;
// Update item quantity
const updateItemQuantity = async (userId, itemId, quantity) => {
    const cart = await cart_model_1.default.findOneAndUpdate({
        userId: new mongoose_1.Types.ObjectId(userId),
        "items._id": new mongoose_1.Types.ObjectId(itemId),
    }, { $set: { "items.$.quantity": quantity } }, { new: true }).populate("items.productId", "name slug imageUrl price discountPrice stockQuantity status");
    return cart;
};
exports.updateItemQuantity = updateItemQuantity;
// Remove item from cart
const removeItem = async (userId, itemId) => {
    const cart = await cart_model_1.default.findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, { $pull: { items: { _id: new mongoose_1.Types.ObjectId(itemId) } } }, { new: true }).populate("items.productId", "name slug imageUrl price discountPrice stockQuantity status");
    return cart;
};
exports.removeItem = removeItem;
