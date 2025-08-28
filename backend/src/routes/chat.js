import express from "express";
import { getChats, getMessages, getUserChat } from "../controllers/chat.js";
import { authorizeJwt } from "../middleware/auth.js";

export const chatRouter = express.Router();

chatRouter.get("/", authorizeJwt, getChats);
chatRouter.get("/:chatId", authorizeJwt, getMessages);
chatRouter.post("/createGet", authorizeJwt, getUserChat);
