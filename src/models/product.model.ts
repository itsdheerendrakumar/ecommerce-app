import { Schema, model, models, Types, Document } from "mongoose";

export interface IProductImage {
  publicId: string;
  secureUrl: string;
  isPrimary: boolean;
  position: number;
}

export type ProductStatus = "draft" | "published";

export interface IProduct extends Document {
  name: string;
  shortDescription?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  features?: string[];
  images: IProductImage[];
  status: ProductStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    secureUrl: {
      type: String,
      required: true,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ name: "text", description: "text" });

const Product = models.Product || model<IProduct>("Product", productSchema);

export default Product;
