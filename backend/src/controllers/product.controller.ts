import { Response, NextFunction, Request } from "express";
import { Product } from "../models/product.model";
import { Category } from "../models/category.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const getProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      category,
      minPrice,
      maxPrice,
      minRating,
      sort,
      search,
      featured,
      page = 1,
      limit = 12,
    } = req.query as any;

    const filter: Record<string, any> = { status: "active" };

    if (category) {
      const cat = await Category.findOne({
        $or: [{ slug: category }, { _id: category }],
      });
      if (cat) {
        filter.category = cat._id;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (minRating !== undefined) {
      filter["ratings.average"] = { $gte: minRating };
    }

    if (featured !== undefined) {
      filter.featured = featured;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { "ratings.average": -1 };
        break;
      case "name":
        sortOption = { name: 1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

export const getProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id)
        .populate("category", "name slug")
        .lean();
    } else {
      product = await Product.findOne({ slug: id })
        .populate("category", "name slug")
        .lean();
    }

    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    res.json({
      success: true,
      data: { product },
    });
  }
);

export const getRelatedProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const product = await Product.findById(id).lean();
    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: "active",
    })
      .limit(4)
      .populate("category", "name slug")
      .lean();

    res.json({
      success: true,
      data: { products: related },
    });
  }
);

export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({
          category: cat._id,
          status: "active",
        });
        return { ...cat, productCount };
      })
    );

    res.json({
      success: true,
      data: { categories: categoriesWithCounts },
    });
  }
);

export const searchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { q } = req.query as { q?: string };

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: { products: [], suggestions: [] },
      });
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const [products, suggestions] = await Promise.all([
      Product.find({
        status: "active",
        $or: [
          { name: regex },
          { description: regex },
          { tags: { $in: [regex] } },
        ],
      })
        .limit(20)
        .populate("category", "name slug")
        .lean(),
      Product.distinct("name", {
        status: "active",
        name: regex,
      }).then((names) => names.slice(0, 5)),
    ]);

    res.json({
      success: true,
      data: { products, suggestions },
    });
  }
);
