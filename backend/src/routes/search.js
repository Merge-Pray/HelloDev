import express from "express";
import { authorizeJwt } from "../middleware/auth.js";
import { searchUsers, getCities } from "../controllers/search.js";

export const searchRouter = express.Router();

searchRouter.get("/users", authorizeJwt, searchUsers);
searchRouter.get("/cities", authorizeJwt, getCities);
