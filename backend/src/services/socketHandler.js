import MessageModel from "../models/Message.js";
import UserModel from "../models/user.js";
import ChatModel from "../models/Chat.js";

export const socketHandler = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    const socketId = socket.id;

    console.log(`User ${userId} connected with socket ID: ${socketId}`);

    socket.join(`user:${userId}`);

    try {
      await UserModel.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: null,
      });
    } catch (error) {
      console.error("Failed to update user status:", error);
    }

    socket.on("sendMessage", async (data) => {
      const { content, chatId, recipientId } = data;
      try {
        const message = await MessageModel.create({
          chat: chatId,
          sender: userId,
          recipient: recipientId,
          content: content,
          contentType: "text",
        });
        await message.populate("sender", "username avatar");

        await ChatModel.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
        });

        io.to(`user:${userId}`).emit("receiveMessage", message);
        io.to(`user:${recipientId}`).emit("receiveMessage", message);
      } catch (error) {
        console.error("Error saving and emitting message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    socket.on("typing", (data) => {
      const { chatId, recipientId } = data;
      io.to(`user:${recipientId}`).emit("userTyping", {
        chatId,
        userId,
        username: socket.user.username,
        isTyping: true,
      });
    });

    socket.on("stopTyping", (data) => {
      const { chatId, recipientId } = data;
      io.to(`user:${recipientId}`).emit("userTyping", {
        chatId,
        userId,
        username: socket.user.username,
        isTyping: false,
      });
    });

    socket.on("disconnect", async () => {
      console.log(`User ${userId} disconnected`);

      const userSockets = await io.in(`user:${userId}`).fetchSockets();

      if (userSockets.length === 0) {
        try {
          await UserModel.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        } catch (error) {
          console.error("Failed to update user status:", error);
        }
      }
    });
  });
};
