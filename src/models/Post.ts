import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: mongoose.Types.ObjectId;
  coverImage?: string;
  categories?: mongoose.Types.ObjectId[];
  tags?: string[];
  comments?: mongoose.Types.ObjectId[];
  published: boolean;
  publishedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
  views: number;
  likes: number;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: "",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    categories: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Category",
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Post ||
  mongoose.model<IPost>("Post", PostSchema);
