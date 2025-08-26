import express from "express";
import {
  getUserMatches,
  contactMatch,
  dismissMatch,
} from "../controllers/match.js";
import { authorizeJwt } from "../middleware/auth.js";

export const matchRouter = express.Router();

matchRouter.get("/", authorizeJwt, getUserMatches);
matchRouter.post("/:matchId/contact", authorizeJwt, contactMatch);
matchRouter.post("/:matchId/dismiss", authorizeJwt, dismissMatch);
