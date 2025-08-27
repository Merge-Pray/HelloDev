import { param } from "express-validator";
import ChatModel from "../models/Chat.js";
import MessageModel from "../models/Message.js";

export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await ChatModel.find({ participants: { $in: [userId] } })
      .populate("participants", "username nickname avatar")
      .populate("lastMessage");
    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const requestingUserId = req.user._id;

    const chat = await ChatModel.findOne({
      _id: chatId,
      participants: { $in: [requestingUserId] },
    });

    if (!chat) {
      return res
        .status(403)
        .json({ message: "Access denied or chat not found" });
    }

    const messages = await MessageModel.find({ chat: chatId })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting messages" });
  }
};
