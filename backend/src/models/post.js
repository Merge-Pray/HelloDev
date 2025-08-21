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

    imageUrl: {
      type: String,
      default: null,
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

    isHidden: {
      type: Boolean,
      default: false,
      index: true,
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
PostSchema.index({ imageUrl: 1, createdAt: -1 });

PostSchema.index({
  visibility: 1,
  isHidden: 1,
  createdAt: -1,
});

PostSchema.index({
  content: "text",
  hashtags: "text",
});

const PostModel = model("Post", PostSchema);
export default PostModel;
