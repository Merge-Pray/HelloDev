import express from "express";
import { authorizeJwt } from "../middleware/auth.js";
import { searchUsers } from "../controllers/search.js";

export const searchRouter = express.Router();

searchRouter.get("/users", authorizeJwt, searchUsers);
