import { model, Schema } from "mongoose";

const MatchSchema = new Schema(
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

    compatibilityScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    scores: {
      technical: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      goalAlignment: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      personal: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },

    badges: [
      {
        type: String,
        enum: [
          "noob-connection",
          "syntax-masters",
          "night-owls",
          "early-birds",
          "local-legends",
          "caffeine-addicts",
          "metal-coders",
          "hydro-homies",
          "linux-ultras",
          "pc-master-race",
          "mobile-gamers",
          "golden-connection",
        ],
      },
    ],

    matchType: {
      type: String,
      enum: ["mentor-mentee", "learnpartner", "networking"],
      required: true,
    },

    quality: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      required: true,
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

    lastCalculated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

MatchSchema.index({ user1: 1, user2: 1 }, { unique: true });
MatchSchema.index({ user1: 1, compatibilityScore: -1 });
MatchSchema.index({ user2: 1, compatibilityScore: -1 });
MatchSchema.index({ quality: 1, status: 1 });
MatchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const MatchModel = model("Match", MatchSchema);
export default MatchModel;
