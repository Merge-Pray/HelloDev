import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: false,
      maxlength: 100, // Erweitert für E-Mail-Adressen als Usernames
    },
    nickname: {
      type: String,
      required: false,
      default: "",
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

    // Google Auth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values while keeping uniqueness for non-null values
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
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

    isMatchable: {
      type: Boolean,
      default: false,
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

    avatarData: {
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

    linkedinProfile: {
      type: String,
      default: "",
    },
    githubProfile: {
      type: String,
      default: "",
    },
    personalWebsites: [
      {
        type: String,
      },
    ],
    profileLinksVisibleToContacts: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", UserSchema);
export default UserModel;
