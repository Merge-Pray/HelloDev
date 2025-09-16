import express from "express";
import {
  getPopularSuggestions,
  searchSuggestions,
  addSuggestion,
} from "../controllers/suggestions.js";

export const suggestionRouter = express.Router();

suggestionRouter.get("/popular/:category", getPopularSuggestions);
suggestionRouter.get("/search/:category", searchSuggestions);
suggestionRouter.post("/", addSuggestion);
suggestionRouter.post("/add", addSuggestion);
