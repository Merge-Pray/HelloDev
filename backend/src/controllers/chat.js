import { param } from "express-validator";
import ChatModel from "../models/Chat.js";
import MessageModel from "../models/Message.js";
import UserModel from "../models/user.js";

export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await ChatModel.find({ participants: { $in: [userId] } })
      .populate("participants", "username nickname avatar isOnline")
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

export const getUserChat = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { recipientId } = req.body;

    if (userId.toString() === recipientId) {
      return res
        .status(400)
        .json({ message: "You cannot chat with yourself." });
    }

    const recipient = await UserModel.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found." });
    }

    let chat = await ChatModel.findOne({
      participants: {
        $size: 2,
        $all: [userId, recipientId],
      },
    });

    if (!chat) {
      chat = await ChatModel.create({
        participants: [userId, recipientId],
      });
    }

    await chat.populate("participants", "username nickname avatar isOnline");

    res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
