import express from "express";
import {
  createPost,
  getNewsfeed,
  getUserPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  addCommentToPost,
  searchPosts,
  getPostsByHashtag,
  repostPost,
  removeRepost,
  getPostReposts,
} from "../controllers/posts.js";
import { authorizeJwt } from "../middleware/auth.js";
import {
  postValidationRules,
  commentValidationRules,
  repostValidationRules,
  validate,
} from "../middleware/validation.js";

export const postsRouter = express.Router();

postsRouter.use(authorizeJwt);

postsRouter.post("/", postValidationRules(), validate, createPost);
postsRouter.get("/newsfeed", getNewsfeed);
postsRouter.get("/search", searchPosts);
postsRouter.get("/user/:userId", getUserPosts);
postsRouter.get("/hashtag/:hashtag", getPostsByHashtag);

postsRouter.post("/:postId/like", likePost);
postsRouter.post("/:postId/unlike", unlikePost);
postsRouter.post(
  "/:postId/comments",
  commentValidationRules(),
  validate,
  addCommentToPost
);
postsRouter.post(
  "/:postId/repost",
  repostValidationRules(),
  validate,
  repostPost
);
postsRouter.delete("/:postId/repost", removeRepost);
postsRouter.get("/:postId/reposts", getPostReposts);

postsRouter.get("/:postId", getPostById);
postsRouter.delete("/:postId", deletePost);
