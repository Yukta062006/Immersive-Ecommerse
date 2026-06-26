import mongoose, { Schema, Document } from "mongoose";

export interface IProductImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  blurhash?: string;
  sortOrder: number;
}

export interface IProductVariant {
  name: string;
  sku: string;
  price: number;
  stock: number;
  options: Map<string, string>;
}

export interface IProductRatings {
  average: number;
  count: number;
  distribution: Map<string, number>;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  category: mongoose.Types.ObjectId;
  images: IProductImage[];
  variants: IProductVariant[];
  ratings: IProductRatings;
  tags: string[];
  featured: boolean;
  stock: number;
  lowStockThreshold: number;
  status: "active" | "draft" | "archived";
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    blurhash: { type: String },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const productVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    options: {
      type: Map,
      of: String,
      default: new Map(),
    },
  },
  { _id: true }
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    longDescription: { type: String, trim: true },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: [productImageSchema],
    variants: [productVariantSchema],
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
      distribution: {
        type: Map,
        of: Number,
        default: new Map([
          ["1", 0],
          ["2", 0],
          ["3", 0],
          ["4", 0],
          ["5", 0],
        ]),
      },
    },
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },
    weight: { type: Number, min: 0 },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    seoTitle: { type: String, maxlength: 60 },
    seoDescription: { type: String, maxlength: 160 },
  },
  { timestamps: true }
);

productSchema.pre("save", async function (next) {
  if (!this.slug || this.isModified("name")) {
    let baseSlug = generateSlug(this.name);
    let slug = baseSlug;
    let counter = 1;
    const ProductModel = this.constructor as any;
    while (await ProductModel.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ "ratings.average": -1 });
productSchema.index({ featured: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);
