import { model, Schema } from "mongoose";

const ChatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ChatSchema.index({ participants: 1 }, { unique: true, background: true });

const ChatModel = model("Chat", ChatSchema);
export default ChatModel;
