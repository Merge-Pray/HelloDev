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

    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],

    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
        maxlength: 50,
      },
    ],

    likes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    comments: [
      {
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
        mentions: [
          {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

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

    viewCount: {
      type: Number,
      default: 0,
    },

    engagementScore: {
      type: Number,
      default: 0,
      index: true,
    },

    isRepost: {
      type: Boolean,
      default: false,
      index: true,
    },

    originalPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      index: true,
    },

    repostComment: {
      type: String,
      maxlength: 500,
      trim: true,
    },

    repostCount: {
      type: Number,
      default: 0,
      index: true,
    },

    reposts: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: {
          type: String,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

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

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1, visibility: 1 });
PostSchema.index({ hashtags: 1, createdAt: -1 });
PostSchema.index({ mentions: 1, createdAt: -1 });
PostSchema.index({ engagementScore: -1, createdAt: -1 });
PostSchema.index({ isRepost: 1, createdAt: -1 });
PostSchema.index({ originalPost: 1, createdAt: -1 });
PostSchema.index({ repostCount: -1, createdAt: -1 });

PostSchema.index({
  visibility: 1,
  isHidden: 1,
  createdAt: -1,
});

PostSchema.index({
  content: "text",
  hashtags: "text",
});

PostSchema.virtual("likeCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

PostSchema.virtual("commentCount").get(function () {
  return this.comments ? this.comments.length : 0;
});

PostSchema.methods.calculateEngagementScore = function () {
  const ageInHours = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const likeWeight = 2;
  const commentWeight = 5;
  const repostWeight = 10;
  const viewWeight = 0.1;

  const decayFactor = Math.exp(-ageInHours / 24);

  const score =
    (this.likes.length * likeWeight +
      this.comments.length * commentWeight +
      this.repostCount * repostWeight +
      this.viewCount * viewWeight) *
    decayFactor;

  return Math.round(score * 100) / 100;
};

PostSchema.methods.canUserView = function (userId, userContacts = []) {
  if (this.isHidden) return false;

  switch (this.visibility) {
    case "public":
      return true;
    case "contacts_only":
      return (
        userContacts.includes(this.author.toString()) ||
        this.author.toString() === userId.toString()
      );
    case "private":
      return this.author.toString() === userId.toString();
    default:
      return false;
  }
};

PostSchema.methods.addLike = function (userId) {
  const existingLike = this.likes.find(
    (like) => like.user.toString() === userId.toString()
  );

  if (!existingLike) {
    this.likes.push({ user: userId });
    this.engagementScore = this.calculateEngagementScore();
    return true;
  }
  return false;
};

PostSchema.methods.removeLike = function (userId) {
  const likeIndex = this.likes.findIndex(
    (like) => like.user.toString() === userId.toString()
  );

  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    this.engagementScore = this.calculateEngagementScore();
    return true;
  }
  return false;
};

PostSchema.methods.addComment = function (authorId, content, mentions = []) {
  this.comments.push({
    author: authorId,
    content: content.trim(),
    mentions: mentions,
    createdAt: new Date(),
  });
  this.engagementScore = this.calculateEngagementScore();
};

PostSchema.pre("save", function (next) {
  if (
    this.isModified("likes") ||
    this.isModified("comments") ||
    this.isModified("viewCount") ||
    this.isModified("repostCount")
  ) {
    this.engagementScore = this.calculateEngagementScore();
  }
  next();
});

const PostModel = model("Post", PostSchema);
export default PostModel;
