import PostModel from "../models/post.js";
import UserModel from "../models/user.js";

// Create a new post
export const createPost = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      content,
      postType = "text",
      projectDetails,
      helpRequest,
      achievement,
      hashtags = [],
      visibility = "public"
    } = req.body;

    // Extract mentions from content (@username)
    const mentionMatches = content.match(/@(\w+)/g) || [];
    const mentionUsernames = mentionMatches.map(match => match.slice(1));
    
    // Find mentioned users
    const mentionedUsers = await UserModel.find({
      username: { $in: mentionUsernames }
    }).select('_id');
    
    const mentions = mentionedUsers.map(user => user._id);

    // Create the post
    const newPost = new PostModel({
      author: userId,
      content: content.trim(),
      postType,
      projectDetails: postType === "project" ? projectDetails : undefined,
      helpRequest: postType === "help_request" ? helpRequest : undefined,
      achievement: postType === "achievement" ? achievement : undefined,
      mentions,
      hashtags: hashtags.map(tag => tag.toLowerCase().replace(/^#/, '')),
      visibility
    });

    await newPost.save();

    // Populate author info for response
    await newPost.populate('author', 'username avatar');
    await newPost.populate('mentions', 'username');

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost
    });

  } catch (error) {
    next(error);
  }
};

// Get personalized newsfeed
export const getNewsfeed = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 20, 
      algorithm = "mixed" // "chronological", "engagement", "mixed"
    } = req.query;

    const skip = (page - 1) * limit;

    // Get user's contacts for personalized feed
    const currentUser = await UserModel.findById(userId).select('contacts');
    const userContacts = currentUser.contacts || [];

    let sortCriteria;
    let matchCriteria = {
      isHidden: false,
      $or: [
        { visibility: "public" },
        { 
          visibility: "contacts_only", 
          $or: [
            { author: { $in: userContacts } },
            { author: userId }
          ]
        },
        { visibility: "private", author: userId }
      ]
    };

    // Different feed algorithms
    switch (algorithm) {
      case "chronological":
        sortCriteria = { createdAt: -1 };
        break;
      case "engagement":
        sortCriteria = { engagementScore: -1, createdAt: -1 };
        break;
      case "mixed":
      default:
        // Mixed algorithm: boost posts from contacts and recent posts
        const pipeline = [
          { $match: matchCriteria },
          {
            $addFields: {
              isFromContact: {
                $cond: {
                  if: { $in: ["$author", userContacts] },
                  then: 1.5, // Boost factor for contacts
                  else: 1
                }
              },
              recencyScore: {
                $divide: [
                  { $subtract: [new Date(), "$createdAt"] },
                  1000 * 60 * 60 * 24 // Convert to days
                ]
              }
            }
          },
          {
            $addFields: {
              finalScore: {
                $multiply: [
                  "$engagementScore",
                  "$isFromContact",
                  { $exp: { $multiply: ["$recencyScore", -0.1] } } // Decay over time
                ]
              }
            }
          },
          { $sort: { finalScore: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: parseInt(limit) }
        ];

        const mixedPosts = await PostModel.aggregate(pipeline);
        
        // Populate the aggregated results
        const populatedMixedPosts = await PostModel.populate(mixedPosts, [
          { path: 'author', select: 'username avatar isOnline lastSeen' },
          { path: 'mentions', select: 'username' },
          { path: 'likes.user', select: 'username' },
          { path: 'comments.author', select: 'username avatar' }
        ]);

        return res.json({
          success: true,
          posts: populatedMixedPosts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(await PostModel.countDocuments(matchCriteria) / limit),
            hasNextPage: populatedMixedPosts.length === parseInt(limit)
          }
        });
    }

    // For chronological and engagement algorithms
    const posts = await PostModel.find(matchCriteria)
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username avatar isOnline lastSeen')
      .populate('mentions', 'username')
      .populate('likes.user', 'username')
      .populate('comments.author', 'username avatar')
      .lean();

    const totalPosts = await PostModel.countDocuments(matchCriteria);

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: posts.length === parseInt(limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get posts by a specific user
export const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    // Check if current user can view this user's posts
    const targetUser = await UserModel.findById(userId).select('contacts');
    const currentUser = await UserModel.findById(currentUserId).select('contacts');
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Determine visibility based on relationship
    let visibilityFilter;
    if (userId === currentUserId.toString()) {
      // Own posts - can see all
      visibilityFilter = {};
    } else if (currentUser.contacts.includes(userId)) {
      // Contact - can see public and contacts_only
      visibilityFilter = {
        visibility: { $in: ["public", "contacts_only"] }
      };
    } else {
      // Stranger - only public posts
      visibilityFilter = {
        visibility: "public"
      };
    }

    const posts = await PostModel.find({
      author: userId,
      isHidden: false,
      ...visibilityFilter
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username avatar')
      .populate('mentions', 'username')
      .populate('likes.user', 'username')
      .populate('comments.author', 'username avatar')
      .lean();

    const totalPosts = await PostModel.countDocuments({
      author: userId,
      isHidden: false,
      ...visibilityFilter
    });

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: posts.length === parseInt(limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get a specific post by ID
export const getPostById = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await PostModel.findById(postId)
      .populate('author', 'username avatar isOnline lastSeen')
      .populate('mentions', 'username')
      .populate('likes.user', 'username')
      .populate('comments.author', 'username avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Check if user can view this post
    const currentUser = await UserModel.findById(userId).select('contacts');
    if (!post.canUserView(userId, currentUser.contacts)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this post"
      });
    }

    res.json({
      success: true,
      post
    });

  } catch (error) {
    next(error);
  }
};

// Update a post
export const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Only author can update their post
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own posts"
      });
    }

    // Update mentions if content changed
    if (updates.content) {
      const mentionMatches = updates.content.match(/@(\w+)/g) || [];
      const mentionUsernames = mentionMatches.map(match => match.slice(1));
      
      const mentionedUsers = await UserModel.find({
        username: { $in: mentionUsernames }
      }).select('_id');
      
      updates.mentions = mentionedUsers.map(user => user._id);
    }

    // Clean hashtags
    if (updates.hashtags) {
      updates.hashtags = updates.hashtags.map(tag => tag.toLowerCase().replace(/^#/, ''));
    }

    Object.assign(post, updates);
    await post.save();

    await post.populate('author', 'username avatar');
    await post.populate('mentions', 'username');

    res.json({
      success: true,
      message: "Post updated successfully",
      post
    });

  } catch (error) {
    next(error);
  }
};

// Delete a post
export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Only author can delete their post
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts"
      });
    }

    await PostModel.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};

// Like a post
export const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const liked = post.addLike(userId);
    
    if (!liked) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this post"
      });
    }

    await post.save();

    res.json({
      success: true,
      message: "Post liked successfully",
      likeCount: post.likes.length
    });

  } catch (error) {
    next(error);
  }
};

// Unlike a post
export const unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const unliked = post.removeLike(userId);
    
    if (!unliked) {
      return res.status(400).json({
        success: false,
        message: "You haven't liked this post"
      });
    }

    await post.save();

    res.json({
      success: true,
      message: "Post unliked successfully",
      likeCount: post.likes.length
    });

  } catch (error) {
    next(error);
  }
};

// Add a comment to a post
export const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Extract mentions from comment
    const mentionMatches = content.match(/@(\w+)/g) || [];
    const mentionUsernames = mentionMatches.map(match => match.slice(1));
    
    const mentionedUsers = await UserModel.find({
      username: { $in: mentionUsernames }
    }).select('_id');
    
    const mentions = mentionedUsers.map(user => user._id);

    post.addComment(userId, content, mentions);
    await post.save();

    // Get the newly added comment with populated author
    await post.populate('comments.author', 'username avatar');
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
      commentCount: post.comments.length
    });

  } catch (error) {
    next(error);
  }
};

// Delete a comment
export const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Only comment author or post author can delete
    if (comment.author.toString() !== userId.toString() && 
        post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments"
      });
    }

    comment.deleteOne();
    post.engagementScore = post.calculateEngagementScore();
    await post.save();

    res.json({
      success: true,
      message: "Comment deleted successfully",
      commentCount: post.comments.length
    });

  } catch (error) {
    next(error);
  }
};

// Search posts
export const searchPosts = async (req, res, next) => {
  try {
    const { q, postType, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    const skip = (page - 1) * limit;

    // Get user's contacts for visibility filtering
    const currentUser = await UserModel.findById(userId).select('contacts');
    const userContacts = currentUser.contacts || [];

    let matchCriteria = {
      $text: { $search: q },
      isHidden: false,
      $or: [
        { visibility: "public" },
        { 
          visibility: "contacts_only", 
          $or: [
            { author: { $in: userContacts } },
            { author: userId }
          ]
        },
        { visibility: "private", author: userId }
      ]
    };

    if (postType) {
      matchCriteria.postType = postType;
    }

    const posts = await PostModel.find(matchCriteria)
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username avatar')
      .populate('mentions', 'username')
      .lean();

    const totalPosts = await PostModel.countDocuments(matchCriteria);

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: posts.length === parseInt(limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get posts by hashtag
export const getPostsByHashtag = async (req, res, next) => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const skip = (page - 1) * limit;
    const cleanHashtag = hashtag.toLowerCase().replace(/^#/, '');

    // Get user's contacts for visibility filtering
    const currentUser = await UserModel.findById(userId).select('contacts');
    const userContacts = currentUser.contacts || [];

    const matchCriteria = {
      hashtags: cleanHashtag,
      isHidden: false,
      $or: [
        { visibility: "public" },
        { 
          visibility: "contacts_only", 
          $or: [
            { author: { $in: userContacts } },
            { author: userId }
          ]
        },
        { visibility: "private", author: userId }
      ]
    };

    const posts = await PostModel.find(matchCriteria)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username avatar')
      .populate('mentions', 'username')
      .lean();

    const totalPosts = await PostModel.countDocuments(matchCriteria);

    res.json({
      success: true,
      hashtag: cleanHashtag,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: posts.length === parseInt(limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

// Report a post
export const reportPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    post.reportCount += 1;
    post.isReported = true;

    // Auto-hide posts with many reports
    if (post.reportCount >= 5) {
      post.isHidden = true;
    }

    await post.save();

    res.json({
      success: true,
      message: "Post reported successfully"
    });

  } catch (error) {
    next(error);
  }
};

// Increment view count
export const incrementViewCount = async (req, res, next) => {
  try {
    const { postId } = req.params;

    await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    res.json({
      success: true,
      message: "View count updated"
    });

  } catch (error) {
    next(error);
  }
};