import express from "express";
import {
  authorizeJwt,
  refreshToken,
  checkAuthStatus,
} from "../middleware/auth.js";
import {
  createUser,
  verifyLogin,
  logout,
  getUserData,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.js";
import { registerValidationRules, validate } from "../middleware/validation.js";

export const userRouter = express.Router();

userRouter
  .post("/register", registerValidationRules(), validate, createUser)
  .post("/login", verifyLogin)
  .post("/logout", logout)
  .post("/refresh", refreshToken)
  .get("/auth-status", checkAuthStatus)
  .get("/user", authorizeJwt, getUserData)
  .get("/profile/:userId", authorizeJwt, getUserProfile)
  .patch("/update", authorizeJwt, updateUserProfile);
