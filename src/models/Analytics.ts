import mongoose, { Schema, Document } from "mongoose";

export interface IAnalytics extends Document {
  user?: mongoose.Types.ObjectId;
  ip: string;
  url: string;
  userAgent: string;
  referrer?: string;
  createdAt: Date;
}

const AnalyticsSchema: Schema = new Schema<IAnalytics>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: false },
  ip: { type: String, required: true },
  url: { type: String, required: true },
  userAgent: { type: String, required: true },
  referrer: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);
