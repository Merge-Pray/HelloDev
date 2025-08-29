import express from "express";
import {
  getChats,
  getMessages,
  getUserChat,
  markMessagesAsRead,
  getTotalUnreadCount,
} from "../controllers/chat.js";
import { authorizeJwt } from "../middleware/auth.js";

export const chatRouter = express.Router();

chatRouter.get("/", authorizeJwt, getChats);
chatRouter.get("/unread-count", authorizeJwt, getTotalUnreadCount);
chatRouter.get("/:chatId", authorizeJwt, getMessages);
chatRouter.post("/createGet", authorizeJwt, getUserChat);
chatRouter.patch("/:chatId/mark-read", authorizeJwt, markMessagesAsRead);
