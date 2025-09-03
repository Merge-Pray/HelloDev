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

    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await MessageModel.countDocuments({
          chat: chat._id,
          recipient: userId,
          isRead: false,
        });

        return {
          ...chat.toObject(),
          unreadCount: Math.max(0, unreadCount),
        };
      })
    );

    const sortedChats = chatsWithUnreadCount.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });

    res.status(200).json(sortedChats);
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

export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await ChatModel.findOne({
      _id: chatId,
      participants: { $in: [userId] },
    });

    if (!chat) {
      return res
        .status(403)
        .json({ message: "Access denied or chat not found" });
    }

    const result = await MessageModel.updateMany(
      {
        chat: chatId,
        recipient: userId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    if (result.modifiedCount > 0) {
      const totalUnreadCount = await MessageModel.countDocuments({
        recipient: userId,
        isRead: false,
      });

      const io = req.app.get("socketio");
      if (io) {
        io.to(`user:${userId}`).emit("unreadCountUpdate", {
          totalUnreadCount,
        });
      }
    }

    res.status(200).json({
      message: "Messages marked as read",
      markedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking messages as read" });
  }
};

export const getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalUnreadCount = await MessageModel.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.status(200).json({ totalUnreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting unread count" });
  }
};
