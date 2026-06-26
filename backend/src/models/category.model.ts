import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: { type: String, trim: true },
    image: { type: String },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    this.slug = generateSlug(this.name);
  }
  next();
});

categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ sortOrder: 1 });

export const Category = mongoose.model<ICategory>("Category", categorySchema);
