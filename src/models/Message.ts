import mongoose from "mongoose";

interface IMessage extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  published: boolean;
  showInSatisfactions: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  showInSatisfactions: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const Message =
  mongoose.models.Message || new mongoose.Model("Message", MessageSchema);

export default Message;
