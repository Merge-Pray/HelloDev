import { model, Schema } from "mongoose";

const ContactRequestSchema = new Schema(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "friend_request",
        "friend_request_accepted",
        "friend_request_declined",
        "friend_removed",
        "match_found",
        "message_received",
        "post_liked",
        "post_commented",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "connected", "dismissed"],
      default: "pending",
    },
    contactedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    dismissedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    connectedAt: {
      type: Date,
    },

    relatedData: {
      matchId: {
        type: Schema.Types.ObjectId,
        ref: "Match",
      },
      postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indizes für bessere Performance
ContactRequestSchema.index({ user2: 1, isRead: 1 });
ContactRequestSchema.index({ user2: 1, type: 1 });
ContactRequestSchema.index({ user1: 1, user2: 1 });

const ContactRequestModel = model("Contactrequest", ContactRequestSchema);
export default ContactRequestModel;
