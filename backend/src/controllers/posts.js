import PostModel from "../models/post.js";
import UserModel from "../models/user.js";

const calculateEngagementScore = (post) => {
  const likeWeight = 1;
  const commentWeight = 2;
  const repostWeight = 3;

  const score =
    post.likes.length * likeWeight +
    post.comments.length * commentWeight +
    post.repostCount * repostWeight;

  return score;
};

const canUserView = (post, userId, authorContacts = []) => {
  if (post.isHidden) return false;

  switch (post.visibility) {
    case "public":
      return true;
    case "contacts_only":
      return (
        authorContacts.includes(userId.toString()) ||
        post.author.toString() === userId.toString()
      );
    case "private":
      return post.author.toString() === userId.toString();
    default:
      return false;
  }
};

const addLike = (post, userId) => {
  const existingLike = post.likes.find(
    (like) => like.user.toString() === userId.toString()
  );

  if (!existingLike) {
    post.likes.push({ user: userId });
    post.engagementScore = calculateEngagementScore(post);
    return true;
  }
  return false;
};

const removeLike = (post, userId) => {
  const likeIndex = post.likes.findIndex(
    (like) => like.user.toString() === userId.toString()
  );

  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1);
    post.engagementScore = calculateEngagementScore(post);
    return true;
  }
  return false;
};

const addComment = (post, authorId, content, mentions = [], imageUrl = null) => {
  const commentData = {
    author: authorId,
    content: content ? content.trim() : "",
    mentions: mentions,
    createdAt: new Date(),
  };
  
  if (imageUrl) {
    commentData.imageUrl = imageUrl.trim();
  }
  
  post.comments.push(commentData);
  post.engagementScore = calculateEngagementScore(post);
};

export const createPost = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      content,
      hashtags = [],
      visibility = "public",
      imageUrl,
    } = req.body;

    if ((!content || !content.trim()) && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Post must contain either text content or an image",
      });
    }

    const mentionMatches = content.match(/@(\w+)/g) || [];
    const mentionUsernames = mentionMatches.map((match) => match.slice(1));

    const mentionedUsers = await UserModel.find({
      username: { $in: mentionUsernames },
    }).select("_id");

    const mentions = mentionedUsers.map((user) => user._id);

    const newPost = new PostModel({
      author: userId,
      content: content.trim(),
      imageUrl: imageUrl || null,
      mentions,
      hashtags: hashtags.map((tag) => tag.toLowerCase().replace(/^#/, "")),
      visibility,
    });

    await newPost.save();

    await newPost.populate("author", "username nickname avatar");
    await newPost.populate("mentions", "username nickname");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    next(error);
  }
};

export const getNewsfeed = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 20,
      algorithm = "chronological",
      feedType = "all",
    } = req.query;

    const skip = (page - 1) * limit;

    const currentUser = await UserModel.findById(userId).select("contacts");
    const userContacts = currentUser.contacts || [];

    let matchCriteria;

    if (feedType === "contacts") {
      matchCriteria = {
        isHidden: false,
        $or: [
          {
            author: { $in: userContacts },
            visibility: { $in: ["public", "contacts_only"] },
          },
          { author: userId },
        ],
      };
    } else {
      const authorsWithUserInContacts = await UserModel.find({
        contacts: userId
      }).select("_id");
      const authorIds = authorsWithUserInContacts.map(user => user._id);

      matchCriteria = {
        isHidden: false,
        $or: [
          { visibility: "public" },
          {
            visibility: "contacts_only",
            author: { $in: authorIds }
          },
          { visibility: "private", author: userId },
        ],
      };
    }

    let sortCriteria;
    if (algorithm === "engagement") {
      sortCriteria = { engagementScore: -1, createdAt: -1 };
    } else {
      sortCriteria = { createdAt: -1 };
    }

    const posts = await PostModel.find(matchCriteria)
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username nickname avatar isOnline lastSeen")
      .populate("mentions", "username nickname")
      .populate("likes.user", "username nickname")
      .populate("comments.author", "username nickname avatar")
      .populate("originalPost")
      .populate("originalPost.author", "username nickname avatar")
      .lean();

    const totalPosts = await PostModel.countDocuments(matchCriteria);

    res.json({
      success: true,
      posts,
      feedType,
      contactsCount: userContacts.length,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: posts.length === parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const targetUser = await UserModel.findById(userId).select("contacts");
    const currentUser = await UserModel.findById(currentUserId).select(
      "contacts"
    );

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let visibilityFilter;
    if (userId === currentUserId.toString()) {
      visibilityFilter = {};
    } else if (currentUser.contacts.includes(userId)) {
      visibilityFilter = {
        visibility: { $in: ["public", "contacts_only"] },
      };
    } else {
      visibilityFilter = { visibility: "public" };
    }

    const posts = await PostModel.find({
      author: userId,
      isHidden: false,
      ...visibilityFilter,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username nickname avatar")
      .populate("mentions", "username nickname")
      .populate("likes.user", "username nickname")
      .populate("comments.author", "username nickname avatar")
      .lean();

    const totalPosts = await PostModel.countDocuments({
      author: userId,
      isHidden: false,
      ...visibilityFilter,
    });

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: posts.length === parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await PostModel.findById(postId)
      .populate("author", "username nickname avatar isOnline lastSeen")
      .populate("mentions", "username nickname")
      .populate("likes.user", "username nickname")
      .populate("comments.author", "username nickname avatar");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const currentUser = await UserModel.findById(userId).select("contacts");
    if (!canUserView(post, userId, currentUser.contacts)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this post",
      });
    }

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    await PostModel.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const liked = addLike(post, userId);

    await post.save();

    res.json({
      success: true,
      message: liked ? "Post liked successfully" : "Post already liked",
      likeCount: post.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const unliked = removeLike(post, userId);

    await post.save();

    res.json({
      success: true,
      message: unliked ? "Post unliked successfully" : "Post wasn't liked",
      likeCount: post.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

export const addCommentToPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { content, imageUrl } = req.body;

    if (!content?.trim() && !imageUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment must have either content or an image",
      });
    }

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const mentionMatches = (content || "").match(/@(\w+)/g) || [];
    const mentionUsernames = mentionMatches.map((match) => match.slice(1));

    const mentionedUsers = await UserModel.find({
      username: { $in: mentionUsernames },
    }).select("_id");

    const mentions = mentionedUsers.map((user) => user._id);

    addComment(post, userId, content, mentions, imageUrl);
    await post.save();

    await post.populate("comments.author", "username nickname avatar");
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
      commentCount: post.comments.length,
    });
  } catch (error) {
    next(error);
  }
};

export const searchPosts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    const skip = (page - 1) * limit;

    const authorsWithUserInContacts = await UserModel.find({
      contacts: userId
    }).select("_id");
    const authorIds = authorsWithUserInContacts.map(user => user._id);

    const searchUsers = await UserModel.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { nickname: { $regex: q, $options: "i" } }
      ]
    }).select("_id");
    const userIds = searchUsers.map(user => user._id);

    let matchCriteria = {
      $or: [
        { $text: { $search: q } },
        { author: { $in: userIds } }
      ],
      isHidden: false,
      $and: [
        {
          $or: [
            { visibility: "public" },
            {
              visibility: "contacts_only",
              author: { $in: authorIds }
            },
            { visibility: "private", author: userId },
          ]
        }
      ]
    };

    const posts = await PostModel.find(matchCriteria)
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username nickname avatar")
      .populate("mentions", "username nickname")
      .lean();

    const totalPosts = await PostModel.countDocuments(matchCriteria);

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: posts.length === parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPostsByHashtag = async (req, res, next) => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const skip = (page - 1) * limit;
    const cleanHashtag = hashtag.toLowerCase().replace(/^#/, "");

    const authorsWithUserInContacts = await UserModel.find({
      contacts: userId
    }).select("_id");
    const authorIds = authorsWithUserInContacts.map(user => user._id);

    const matchCriteria = {
      hashtags: cleanHashtag,
      isHidden: false,
      $or: [
        { visibility: "public" },
        {
          visibility: "contacts_only",
          author: { $in: authorIds }
        },
        { visibility: "private", author: userId },
      ],
    };

    const posts = await PostModel.find(matchCriteria)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username nickname avatar")
      .populate("mentions", "username nickname")
      .lean();

    const totalPosts = await PostModel.countDocuments(matchCriteria);

    res.json({
      success: true,
      hashtag: cleanHashtag,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: posts.length === parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const repostPost = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const { comment = "" } = req.body;

    const originalPost = await PostModel.findById(postId);
    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const existingRepost = await PostModel.findOne({
      author: userId,
      originalPost: postId,
      isRepost: true,
    });

    if (existingRepost) {
      return res.status(400).json({
        success: false,
        message: "You have already reposted this post",
      });
    }

    if (originalPost.author.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot repost your own post",
      });
    }

    const repost = new PostModel({
      author: userId,
      content: originalPost.content,
      imageUrl: originalPost.imageUrl,
      isRepost: true,
      originalPost: postId,
      repostComment: comment.trim(),
      hashtags: originalPost.hashtags,
      visibility: "public",
    });

    await repost.save();

    await PostModel.findByIdAndUpdate(postId, {
      $inc: { repostCount: 1 },
      $push: {
        reposts: {
          user: userId,
          comment: comment.trim(),
          createdAt: new Date(),
        },
      },
    });

    originalPost.engagementScore = calculateEngagementScore(originalPost);
    await originalPost.save();

    await repost.populate("author", "username nickname avatar");
    await repost.populate("originalPost");
    await repost.populate("originalPost.author", "username nickname avatar");

    res.status(201).json({
      success: true,
      message: "Post reposted successfully",
      repost: repost,
    });
  } catch (error) {
    next(error);
  }
};

export const removeRepost = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const repost = await PostModel.findOneAndDelete({
      author: userId,
      originalPost: postId,
      isRepost: true,
    });

    if (!repost) {
      return res.status(404).json({
        success: false,
        message: "Repost not found",
      });
    }

    const originalPost = await PostModel.findByIdAndUpdate(postId, {
      $inc: { repostCount: -1 },
      $pull: { reposts: { user: userId } },
    });

    if (originalPost) {
      originalPost.engagementScore = calculateEngagementScore(originalPost);
      await originalPost.save();
    }

    res.json({
      success: true,
      message: "Repost removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getPostReposts = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const reposts = await PostModel.find({
      originalPost: postId,
      isRepost: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username nickname avatar")
      .populate("originalPost")
      .lean();

    const totalReposts = await PostModel.countDocuments({
      originalPost: postId,
      isRepost: true,
    });

    res.json({
      success: true,
      reposts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReposts / limit),
        hasNextPage: reposts.length === parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add endpoint to get posts with images only
export const getImagePosts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const currentUser = await UserModel.findById(userId).select("contacts");
    const userContacts = currentUser.contacts || [];

    const matchCriteria = {
      imageUrl: { $ne: null }, // Only posts with images
      isHidden: false,
      $or: [
        { visibility: "public" },
        {
          visibility: "contacts_only",
          $or: [{ author: { $in: userContacts } }, { author: userId }],
        },
        { visibility: "private", author: userId },
      ],
    };

    const posts = await PostModel.find(matchCriteria)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username nickname avatar")
      .populate("mentions", "username nickname")
      .lean();

    const totalPosts = await PostModel.countDocuments(matchCriteria);

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: posts.length === parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
