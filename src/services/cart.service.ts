import Cart, { ICart } from "../models/cart.model";
import { Types } from "mongoose";

// Get cart for user (creates empty cart if none exists)
export const getCart = async (userId: string): Promise<ICart> => {
  let cart = await Cart.findOne({ userId: new Types.ObjectId(userId) }).populate(
    "items.productId",
    "name slug imageUrl price discountPrice stockQuantity status"
  );

  if (!cart) {
    cart = await Cart.create({ userId: new Types.ObjectId(userId), items: [] });
  }

  return cart;
};

// Add item to cart (increments quantity if product already exists)
export const addItem = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<ICart> => {
  let cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });

  if (!cart) {
    cart = await Cart.create({
      userId: new Types.ObjectId(userId),
      items: [{ productId: new Types.ObjectId(productId), quantity }],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(productId),
        quantity,
      });
    }

    await cart.save();
  }

  return Cart.findById(cart._id).populate(
    "items.productId",
    "name slug imageUrl price discountPrice stockQuantity status"
  ) as Promise<ICart>;
};

// Update item quantity
export const updateItemQuantity = async (
  userId: string,
  itemId: string,
  quantity: number
): Promise<ICart | null> => {
  const cart = await Cart.findOneAndUpdate(
    {
      userId: new Types.ObjectId(userId),
      "items._id": new Types.ObjectId(itemId),
    },
    { $set: { "items.$.quantity": quantity } },
    { new: true }
  ).populate(
    "items.productId",
    "name slug imageUrl price discountPrice stockQuantity status"
  );

  return cart;
};

// Remove item from cart
export const removeItem = async (
  userId: string,
  itemId: string
): Promise<ICart | null> => {
  const cart = await Cart.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { $pull: { items: { _id: new Types.ObjectId(itemId) } } },
    { new: true }
  ).populate(
    "items.productId",
    "name slug imageUrl price discountPrice stockQuantity status"
  );

  return cart;
};
