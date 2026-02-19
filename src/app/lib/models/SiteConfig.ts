import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteConfig extends Document {
  announcementEnabled: boolean;
  freeShippingMinValue: number;
  updatedAt: Date;
}

const SiteConfigSchema = new Schema<ISiteConfig>(
  {
    announcementEnabled: {
      type: Boolean,
      default: true,
    },
    freeShippingMinValue: {
      type: Number,
      default: 299,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const SiteConfig: Model<ISiteConfig> =
  mongoose.models.SiteConfig ||
  mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);

export default SiteConfig;
