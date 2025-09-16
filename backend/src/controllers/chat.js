import { param } from "express-validator";
import ChatModel from "../models/Chat.js";
import MessageModel from "../models/Message.js";
import UserModel from "../models/user.js";
import { batchDecrypt, decrypt } from "../utils/encryption.js";

export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await ChatModel.find({ participants: userId })
      .populate("participants", "username nickname avatar isOnline")
      .populate("lastMessage");

    const currentUser = await UserModel.findById(userId).select("contacts");

    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await MessageModel.countDocuments({
          chat: chat._id,
          recipient: userId,
          isRead: false,
        });

        const otherParticipant = chat.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );
        const areFriends = currentUser.contacts.includes(otherParticipant._id);

        let decryptedLastMessage = null;
        if (chat.lastMessage) {
          try {
            decryptedLastMessage = {
              ...chat.lastMessage.toObject(),
              content: decrypt({
                encryptedContent: chat.lastMessage.encryptedContent,
                iv: chat.lastMessage.iv,
                authTag: chat.lastMessage.authTag,
              }),
            };
          } catch (error) {
            console.error("Failed to decrypt last message:", error);
            decryptedLastMessage = {
              ...chat.lastMessage.toObject(),
              content: "[Encrypted message]",
            };
          }
        }

        return {
          ...chat.toObject(),
          lastMessage: decryptedLastMessage,
          unreadCount: Math.max(0, unreadCount),
          areFriends,
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
      participants: requestingUserId,
    }).populate("participants", "username nickname avatar");

    if (!chat) {
      return res
        .status(403)
        .json({ message: "Access denied or chat not found" });
    }

    const currentUser = await UserModel.findById(requestingUserId).select(
      "contacts"
    );
    const otherParticipant = chat.participants.find(
      (p) => p._id.toString() !== requestingUserId.toString()
    );
    const areFriends = currentUser.contacts.includes(otherParticipant._id);

    const encryptedMessages = await MessageModel.find({ chat: chatId })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    const messages = batchDecrypt(encryptedMessages);

    res.status(200).json({
      messages,
      areFriends,
      otherUser: otherParticipant,
    });
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
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    const recipient = await UserModel.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    const sortedParticipants = [
      userId.toString(),
      recipientId.toString(),
    ].sort();

    let chat = await ChatModel.findOne({
      participants: { $all: sortedParticipants, $size: 2 },
    });

    if (!chat) {
      try {
        chat = await ChatModel.create({
          participants: sortedParticipants,
        });
      } catch (createError) {
        if (createError.code === 11000) {
          chat = await ChatModel.findOne({
            participants: { $all: sortedParticipants, $size: 2 },
          });
        }
        if (!chat) {
          throw createError;
        }
      }
    }

    await chat.populate("participants", "username nickname avatar isOnline");

    res.status(200).json(chat);
  } catch (error) {
    console.error("getUserChat error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await ChatModel.findOne({
      _id: chatId,
      participants: userId,
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
