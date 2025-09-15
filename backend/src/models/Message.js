import { model, Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    encryptedContent: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    authTag: {
      type: String,
      required: true,
    },
    encryptionVersion: {
      type: Number,
      default: 1,
    },
    contentType: {
      type: String,
      enum: ["text", "code"],
      default: "text",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ recipient: 1, isRead: 1 });
MessageSchema.index({ chat: 1, recipient: 1, isRead: 1 });

const MessageModel = model("Message", MessageSchema);
export default MessageModel;
