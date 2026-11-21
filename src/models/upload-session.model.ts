import { Schema, model, models, Types, Document } from "mongoose";

export type UploadSessionStatus = "pending" | "uploading" | "completed" | "expired" | "failed";

export interface IUploadedAsset {
  publicId: string;
  secureUrl: string;
  bytes?: number;
  format?: string;
  width?: number;
  height?: number;
  verifiedAt: Date;
}

export interface IUploadSession extends Document {
  productId: Types.ObjectId;
  adminId: Types.ObjectId;
  status: UploadSessionStatus;
  expectedImages: number;
  uploadedAssets: IUploadedAsset[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const uploadedAssetSchema = new Schema<IUploadedAsset>(
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
    bytes: {
      type: Number,
    },
    format: {
      type: String,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const uploadSessionSchema = new Schema<IUploadSession>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "uploading", "completed", "expired", "failed"],
      default: "pending",
      index: true,
    },
    expectedImages: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    uploadedAssets: {
      type: [uploadedAssetSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

uploadSessionSchema.index({ adminId: 1, status: 1 });
uploadSessionSchema.index({ productId: 1, status: 1 });
uploadSessionSchema.index({ status: 1, expiresAt: 1 });

const UploadSession = models.UploadSession || model<IUploadSession>("UploadSession", uploadSessionSchema);

export default UploadSession;
