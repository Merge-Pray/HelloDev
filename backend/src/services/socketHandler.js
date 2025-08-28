import MessageModel from "../models/Message.js";
import UserModel from "../models/user.js";
const connectedUsers = new Map();

export const socketHandler = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.user._id;
    const socketId = socket.id;

    console.log(`User connected with ID: ${socket.id}`);
    try {
      await UserModel.findByIdAndUpdate(userId, {
        isOnline: true,
        socketId: socketId,
      });
      connectedUsers.set(userId.toString(), socketId);
    } catch (error) {
      console.error("Failed to update user status on connection:", error);
    }

    socket.on("sendMessage", async (data) => {
      const { content, chatId, recipientId } = data;
      try {
        const message = await MessageModel.create({
          chat: chatId,
          sender: userId,
          recipient: recipientId,
          content: content,
        });
        await message.populate("sender", "username avatar");
        socket.emit("receiveMessage", message);
        const recipientSocketId = connectedUsers.get(recipientId.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("receiveMessage", message);
        }
      } catch (error) {
        console.error("Error saving and emitting message:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected with ID: ${socket.id}`);
      try {
        await UserModel.findByIdAndUpdate(userId, {
          isOnline: false,
          socketId: null,
          lastSeen: Date.now(),
        });
        connectedUsers.delete(userId.toString());
      } catch (error) {
        console.error("Failed to update user status on connection:", error);
      }
    });
  });
};
