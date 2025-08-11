import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

export const authorizeJwt = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const isVerified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await UserModel.findById(isVerified.id);

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    console.log("Auth successful for user:", req.user.username);
    next();
  } catch (error) {
    console.log("Auth error:", error);
    return res.status(401).json({ message: "Not authorized" });
  }
};
