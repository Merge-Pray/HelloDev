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
      programmingLanguages: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      techStack: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      techArea: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      experienceLevel: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      statusAlignment: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      locationProximity: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      codingTimeCompatibility: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      personalInterests: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      gamingCompatibility: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      personalityMatch: {
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
          "golden-connection"
        ],
      },
    ],

    matchType: {
      type: String,
      enum: [
        "mentor-mentee",
        "learnpartner", 
        "networking",
      ],
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

    lastCalculated: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
