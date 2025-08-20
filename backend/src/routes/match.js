import express from "express";
import { getUserMatches } from "../controllers/match.js";
import { authorizeJwt } from "../middleware/auth.js";

export const matchRouter = express.Router();

matchRouter.get("/", authorizeJwt, getUserMatches);
