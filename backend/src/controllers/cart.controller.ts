import { Response, NextFunction, Request } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Cart } from "../models/cart.model";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const getCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const cart = await Cart.findOne({ user: req.userId })
      .populate("items.product", "name slug price images status stock")
      .lean();

    if (!cart) {
      return res.json({
        success: true,
        data: {
          cart: { user: req.userId, items: [], total: 0 },
        },
      });
    }

    const total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        cart: { ...cart, total },
      },
    });
  }
);

export const addToCart = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { productId, variantId, quantity = 1 } = req.body;

    const product = await Product.findById(productId).lean();
    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    if (product.status !== "active") {
      throw ApiError.badRequest("Product is not available");
    }

    let itemPrice = product.price;
    if (variantId) {
      const variant = product.variants.find(
        (v: any) => (v._id || v.id)?.toString() === variantId
      );
      if (!variant) {
        throw ApiError.notFound("Variant not found");
      }
      if (variant.stock < quantity) {
        throw ApiError.badRequest("Insufficient stock for this variant");
      }
      itemPrice = variant.price;
    } else {
      if (product.stock < quantity) {
        throw ApiError.badRequest("Insufficient stock");
      }
    }

    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      cart = new Cart({
        user: req.userId,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (!variantId
          ? !item.variant
          : item.variant?.toString() === variantId)
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > 99) {
        throw ApiError.badRequest("Maximum quantity per item is 99");
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = itemPrice;
    } else {
      cart.items.push({
        product: productId,
        variant: variantId || undefined,
        quantity,
        price: itemPrice,
        addedAt: new Date(),
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product", "name slug price images status stock")
      .lean();

    const total = populatedCart!.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    res.status(201).json({
      success: true,
      data: {
        cart: { ...populatedCart, total },
      },
    });
  }
);

export const updateCartItem = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      throw ApiError.notFound("Cart not found");
    }

    const item = cart.items.find((i: any) => (i._id || i.id)?.toString() === itemId);
    if (!item) {
      throw ApiError.notFound("Item not found in cart");
    }

    const product = await Product.findById(item.product).lean();
    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    if (item.variant) {
      const variant = product.variants.find(
        (v: any) => (v._id || v.id)?.toString() === item.variant!.toString()
      );
      if (variant && variant.stock < quantity) {
        throw ApiError.badRequest("Insufficient stock");
      }
    } else if (product.stock < quantity) {
      throw ApiError.badRequest("Insufficient stock");
    }

    item.quantity = quantity;
    item.price = product.price;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product", "name slug price images status stock")
      .lean();

    const total = populatedCart!.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        cart: { ...populatedCart, total },
      },
    });
  }
);

export const removeCartItem = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      throw ApiError.notFound("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => (item._id || item.id)?.toString() === itemId
    );
    if (itemIndex === -1) {
      throw ApiError.notFound("Item not found in cart");
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("items.product", "name slug price images status stock")
      .lean();

    const total = populatedCart!.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    res.json({
      success: true,
      data: {
        cart: { ...populatedCart, total },
      },
    });
  }
);

export const clearCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await Cart.findOneAndDelete({ user: req.userId });

    res.json({
      success: true,
      data: {
        cart: { user: req.userId, items: [], total: 0 },
      },
    });
  }
);
