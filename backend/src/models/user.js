import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    hashedPassword: {
      type: String,
      required: false,
    },

    contacts: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    socketId: {
      type: String,
      default: null,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    points: {
      type: Number,
      default: 0,
    },

    avatar: {
      type: String,
      default: null,
    },
    aboutMe: {
      type: String,
      maxlength: 500,
      default: "",
    },

    country: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      min: 13,
      max: 120,
      default: null,
    },

    status: {
      type: String,
      enum: ["searchhelp", "offerhelp", "networking", "learnpartner"],
      default: "networking",
    },

    devExperience: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      default: "beginner",
    },

    techArea: [
      {
        type: String,
      },
    ],

    favoriteTimeToCode: {
      type: String,
      enum: ["earlybird", "daytime", "nightowl"],
      default: "daytime",
    },

    favoriteLineOfCode: {
      type: String,
      maxlength: 200,
      default: "",
    },

    programmingLanguages: [
      {
        type: [String, Number],
        validate: function (arr) {
          return arr.length === 2 && arr[1] >= 1 && arr[1] <= 10;
        },
      },
    ],

    techStack: [
      {
        type: String,
      },
    ],

    preferredOS: {
      type: String,
      enum: ["Windows", "macOS", "Linux", "Other"],
      default: null,
    },

    languages: [
      {
        type: String,
      },
    ],

    gaming: {
      type: String,
      enum: ["none", "pc", "console", "mobile", "board"],
      default: "none",
    },

    otherInterests: [
      {
        type: String,
      },
    ],

    favoriteDrinkWhileCoding: {
      type: String,
      default: "",
    },
    musicGenreWhileCoding: {
      type: String,
      default: "",
    },
    favoriteShowMovie: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", UserSchema);
export default UserModel;

export function calculateProgrammingLanguageScore(user1, user2) {
  if (
    !user1.programmingLanguages?.length ||
    !user2.programmingLanguages?.length
  ) {
    return 0;
  }

  // Create a Set of all languages from both users
  const allLanguages = new Set([
    ...user1.programmingLanguages.map((lang) => lang[0]), // language names
    ...user2.programmingLanguages.map((lang) => lang[0]),
  ]);

  let totalScore = 0;
  let comparisons = 0;

  for (const language of allLanguages) {
    // Find skill levels directly from arrays
    const skill1 =
      user1.programmingLanguages.find((lang) => lang[0] === language)?.[1] || 0;
    const skill2 =
      user2.programmingLanguages.find((lang) => lang[0] === language)?.[1] || 0;

    if (skill1 > 0 && skill2 > 0) {
      const skillDiff = Math.abs(skill1 - skill2);
      const languageScore = Math.max(0, 100 - skillDiff * 10);
      totalScore += languageScore;
      comparisons++;
    }
  }

  return comparisons > 0 ? totalScore / comparisons : 0;
}
