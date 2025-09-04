import MessageModel from "../models/Message.js";
import UserModel from "../models/user.js";
import ChatModel from "../models/Chat.js";

export const socketHandler = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    
    console.log(`🔌 User ${userId} connected`);
    
    socket.join(`user:${userId}`);
    
    await UserModel.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: null,
    });

    socket.on("sendMessage", async (data) => {
      const { content, chatId, recipientId } = data;
      
      try {
        const message = await MessageModel.create({
          chat: chatId,
          sender: userId,
          recipient: recipientId,
          content: content,
          isRead: false,
        });
        
        await message.populate("sender", "username avatar");
        await ChatModel.findByIdAndUpdate(chatId, { lastMessage: message._id });

        io.to(`user:${userId}`).emit("receiveMessage", message);
        io.to(`user:${recipientId}`).emit("receiveMessage", message);

        const unreadCount = await MessageModel.countDocuments({
          recipient: recipientId,
          isRead: false,
        });

        io.to(`user:${recipientId}`).emit("unreadCountUpdate", unreadCount);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("typing", (data) => {
      const { chatId, recipientId } = data;
      io.to(`user:${recipientId}`).emit("userTyping", {
        chatId,
        userId,
        isTyping: true,
      });
    });

    socket.on("stopTyping", (data) => {
      const { chatId, recipientId } = data;
      io.to(`user:${recipientId}`).emit("userTyping", {
        chatId,
        userId,
        isTyping: false,
      });
    });

    socket.on("markAsRead", async (data) => {
      const { chatId } = data;
      
      try {
        await MessageModel.updateMany(
          { chat: chatId, recipient: userId, isRead: false },
          { isRead: true }
        );

        const unreadCount = await MessageModel.countDocuments({
          recipient: userId,
          isRead: false,
        });

        console.log(`📤 Sending unreadCountUpdate to ${userId}: ${unreadCount}`);
        io.to(`user:${userId}`).emit("unreadCountUpdate", unreadCount);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`❌ User ${userId} disconnected`);
      
      setTimeout(async () => {
        const userSockets = await io.in(`user:${userId}`).fetchSockets();
        if (userSockets.length === 0) {
          await UserModel.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        }
      }, 5000);
    });
  });
};
