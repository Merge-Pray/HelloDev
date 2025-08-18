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

// Post CRUD operations
postsRouter
  .post("/", postValidationRules(), validate, createPost)
  .get("/newsfeed", getNewsfeed)
  .get("/user/:userId", getUserPosts)
  .get("/search", searchPosts)
  .get("/hashtag/:hashtag", getPostsByHashtag)
  .get("/:postId", getPostById)
  .put("/:postId", postValidationRules(), validate, updatePost)
  .delete("/:postId", deletePost);

// Post interactions
postsRouter
  .post("/:postId/like", likePost)
  .delete("/:postId/like", unlikePost)
  .post("/:postId/comments", commentValidationRules(), validate, addComment)
  .delete("/:postId/comments/:commentId", deleteComment)
  .post("/:postId/view", incrementViewCount)
  .post("/:postId/report", reportPost);

export default postsRouter;