import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token provided."));
    }

    const isVerified = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(isVerified.id);

    if (!user) {
      return next(new Error("User not found."));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("Socket Authentication Error:", error.message);
    next(new Error("Authentication failed."));
  }
};
