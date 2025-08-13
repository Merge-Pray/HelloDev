import express from "express";
import {
  createUser,
  logout,
  verifyLogin,
  updateUserProfile,
  getUserData,
} from "../controllers/user.js";
import { registerValidationRules, validate } from "../middleware/validation.js";
import { authorizeJwt } from "../middleware/auth.js";

export const userRouter = express.Router();

userRouter
  .post("/register", registerValidationRules(), validate, createUser)
  .post("/login", verifyLogin)
  .post("/logout", logout)
  .get("/user", authorizeJwt, getUserData)
  .patch("/update", authorizeJwt, updateUserProfile);
