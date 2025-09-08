import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests,
  getNotifications,
  markAsRead,
  markAllAsRead,
  removeFriend,
} from "../controllers/contactrequest.js";
import { authorizeJwt } from "../middleware/auth.js";

export const contactRequestRouter = express.Router();

// Friend Request Routes
contactRequestRouter.post("/send", authorizeJwt, sendFriendRequest);
contactRequestRouter.patch(
  "/:requestId/accept",
  authorizeJwt,
  acceptFriendRequest
);
contactRequestRouter.patch(
  "/:requestId/decline",
  authorizeJwt,
  declineFriendRequest
);
contactRequestRouter.get("/friendrequests", authorizeJwt, getFriendRequests);
contactRequestRouter.delete("/friend/:friendId", authorizeJwt, removeFriend);

// Notification Routes
contactRequestRouter.get("/notifications", authorizeJwt, getNotifications);
contactRequestRouter.patch(
  "/notifications/mark-read",
  authorizeJwt,
  markAsRead
);
contactRequestRouter.patch(
  "/notifications/mark-all-read",
  authorizeJwt,
  markAllAsRead
);
