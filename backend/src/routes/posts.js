import express from "express";
import { 
  createPost,
  getNewsfeed,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  searchPosts,
  getPostsByHashtag,
  reportPost,
  incrementViewCount
} from "../controllers/posts.js";
import { authorizeJwt } from "../middleware/auth.js";
import { postValidationRules, commentValidationRules, validate } from "../middleware/validation.js";

export const postsRouter = express.Router();

// All routes require authentication
postsRouter.use(authorizeJwt);

// Specific routes first (before generic :postId routes)
postsRouter.post("/", postValidationRules(), validate, createPost);
postsRouter.get("/newsfeed", getNewsfeed);
postsRouter.get("/search", searchPosts);
postsRouter.get("/user/:userId", getUserPosts);
postsRouter.get("/hashtag/:hashtag", getPostsByHashtag);

// Post interactions (specific paths before generic :postId)
postsRouter.post("/:postId/like", likePost);
postsRouter.delete("/:postId/like", unlikePost);
postsRouter.post("/:postId/comments", commentValidationRules(), validate, addComment);
postsRouter.delete("/:postId/comments/:commentId", deleteComment);
postsRouter.post("/:postId/view", incrementViewCount);
postsRouter.post("/:postId/report", reportPost);

// Generic :postId routes last
postsRouter.get("/:postId", getPostById);
postsRouter.put("/:postId", postValidationRules(), validate, updatePost);
postsRouter.delete("/:postId", deletePost);

