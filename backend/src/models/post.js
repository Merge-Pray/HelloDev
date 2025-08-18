import { model, Schema } from "mongoose";

const PostSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },


    // @mentions in the post
    mentions: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    }],

    // Hashtags for discoverability
    hashtags: [{
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 50,
    }],

    // Engagement metrics
    likes: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],

    comments: [{
      author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        required: true,
        maxlength: 500,
        trim: true,
      },
      mentions: [{
        type: Schema.Types.ObjectId,
        ref: "User",
      }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],

    // Visibility and moderation
    visibility: {
      type: String,
      enum: ["public", "contacts_only", "private"],
      default: "public",
      index: true,
    },

    isReported: {
      type: Boolean,
      default: false,
      index: true,
    },

    reportCount: {
      type: Number,
      default: 0,
    },

    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },

    engagementScore: {
      type: Number,
      default: 0,
      index: true,
    },

    // For pinned posts
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },

    pinnedUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1, visibility: 1 });
PostSchema.index({ hashtags: 1, createdAt: -1 });
PostSchema.index({ mentions: 1, createdAt: -1 });
PostSchema.index({ engagementScore: -1, createdAt: -1 });

// Compound index for newsfeed queries
PostSchema.index({ 
  visibility: 1, 
  isHidden: 1, 
  createdAt: -1 
});

// Text search index for content and hashtags
PostSchema.index({
  content: "text",
  hashtags: "text"
});

// Virtual for like count
PostSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Method to calculate engagement score
PostSchema.methods.calculateEngagementScore = function() {
  const ageInHours = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const likeWeight = 2;
  const commentWeight = 5;
  const viewWeight = 0.1;
  
  // Decay factor - newer posts get higher scores
  const decayFactor = Math.exp(-ageInHours / 24); // 24-hour half-life
  
  const score = (
    (this.likes.length * likeWeight) +
    (this.comments.length * commentWeight) +
    (this.viewCount * viewWeight)
  ) * decayFactor;
  
  return Math.round(score * 100) / 100;
};

// Method to check if user can view this post
PostSchema.methods.canUserView = function(userId, userContacts = []) {
  if (this.isHidden) return false;
  
  switch (this.visibility) {
    case 'public':
      return true;
    case 'contacts_only':
      return userContacts.includes(this.author.toString()) || 
             this.author.toString() === userId.toString();
    case 'private':
      return this.author.toString() === userId.toString();
    default:
      return false;
  }
};

// Method to add a like
PostSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.likes.push({ user: userId });
    this.engagementScore = this.calculateEngagementScore();
    return true;
  }
  return false;
};

// Method to remove a like
PostSchema.methods.removeLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => 
    like.user.toString() === userId.toString()
  );
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    this.engagementScore = this.calculateEngagementScore();
    return true;
  }
  return false;
};

// Method to add a comment
PostSchema.methods.addComment = function(authorId, content, mentions = []) {
  this.comments.push({
    author: authorId,
    content: content.trim(),
    mentions: mentions,
    createdAt: new Date()
  });
  this.engagementScore = this.calculateEngagementScore();
};

// Pre-save middleware to update engagement score
PostSchema.pre('save', function(next) {
  if (this.isModified('likes') || this.isModified('comments') || this.isModified('viewCount')) {
    this.engagementScore = this.calculateEngagementScore();
  }
  next();
});

const PostModel = model("Post", PostSchema);
export default PostModel;