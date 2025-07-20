import { Schema, models, Model, Document, mongo, Types } from "mongoose";

interface ILike extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

const Like = models.Like || new Model("Like", LikeSchema);

export default Like;
