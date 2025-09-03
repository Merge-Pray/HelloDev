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
  getUserContacts,
  googleAuth,
  githubAuth,
} from "../controllers/user.js";
import { registerValidationRules, validate } from "../middleware/validation.js";

export const userRouter = express.Router();

userRouter
  .post("/register", registerValidationRules(), validate, createUser)
  .post("/login", verifyLogin)
  .post("/google-auth", googleAuth)
  .post("/github-auth", githubAuth)
  .post("/logout", logout)
  .post("/refresh", refreshToken)
  .get("/auth-status", checkAuthStatus)
  .get("/user", authorizeJwt, getUserData)
  .get("/contacts", authorizeJwt, getUserContacts)
  .get("/profile/:userId", authorizeJwt, getUserProfile)
  .patch("/update", authorizeJwt, updateUserProfile);
