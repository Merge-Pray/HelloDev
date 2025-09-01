import express from "express";
import {
  authorizeJwtEnhanced as authorizeJwt,
  refreshTokenEnhanced as refreshToken,
  checkAuthStatusEnhanced as checkAuthStatus,
} from "../middleware/authEnhanced.js";
import {
  createUser,
  verifyLogin,
  logout,
  getUserData,
  getUserProfile,
  updateUserProfile,
  getUserContacts,
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
  .get("/contacts", authorizeJwt, getUserContacts)
  .get("/profile/:userId", authorizeJwt, getUserProfile)
  .patch("/update", authorizeJwt, updateUserProfile);
