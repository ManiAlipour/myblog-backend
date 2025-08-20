import { model, models } from "mongoose";
import { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "user" | "admin";
  verificationCode: string;
  verificationCodeExpires: Date | null;
  name?: string;
  avatar?: string;
  isEmailVerified: boolean;

  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    trim: true,
  },
  verificationCode: {
    type: String,
    default: "",
  },
  verificationCodeExpires: {
    type: Date,
    default: null,
  },
  bio: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["user", "admin", "editor"],
    default: "user",
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default models.User || model("User", UserSchema);
