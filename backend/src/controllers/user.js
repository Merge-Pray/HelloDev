import PostModel from "../models/post.js";
import ChatModel from "../models/Chat.js";
import MatchModel from "../models/match.js";
import ContactRequestModel from "../models/contactrequest.js";
import MessageModel from "../models/Message.js";

// Löscht User und alle verknüpften Daten atomar
export const deleteUserAccount = async (req, res, next) => {
  const session = await UserModel.startSession();
  session.startTransaction();
  try {
    const userId = req.user._id;

    await UserModel.updateMany(
      { contacts: userId },
      { $pull: { contacts: userId } }
    ).session(session);
    

    await Promise.all([
      PostModel.deleteMany({ author: userId }).session(session),
      // ChatModel.deleteMany({ participants: userId }).session(session),
      MatchModel.deleteMany({ $or: [{ user1: userId }, { user2: userId }] }).session(session),
      ContactRequestModel.deleteMany({ $or: [{ user1: userId }, { user2: userId }] }).session(session),
      MessageModel.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] }).session(session)
    ]);
    const deleted = await UserModel.findByIdAndDelete(userId).session(session);
    if (!deleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await session.commitTransaction();
    session.endSession();
    res.clearCookie("jwt");
    return res.status(200).json({ success: true, message: "User und alle verknüpften Daten gelöscht" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};
import checkIsMatchable from "../../utils/profileValidator.js";
import { generateToken } from "../libs/jwt.js";
import { hashPassword, comparePassword } from "../libs/pw.js";
import UserModel from "../models/user.js";
import { OAuth2Client } from "google-auth-library";
import {
  pixelizeImageFromUrl,
  dataUrlToBuffer,
  generateAndUploadRandomAvatar,
} from "../utils/imagePixelizer.js";
import { v2 as cloudinary } from "cloudinary";
import { runMatchingForAllUsers } from "../libs/matchingAlgorithm.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getGitHubUserData = async (accessToken) => {
  try {
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "HelloDev-App",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch GitHub user data");
    }

    const userData = await userResponse.json();

    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "HelloDev-App",
      },
    });

    let email = userData.email;
    if (!email && emailResponse.ok) {
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      email = primaryEmail ? primaryEmail.email : emails[0]?.email;
    }

    return {
      id: userData.id.toString(),
      email: email,
      name: userData.name || userData.login,
      username: userData.login,
      avatar_url: userData.avatar_url,
    };
  } catch (error) {
    console.error("Error fetching GitHub user data:", error);
    throw error;
  }
};

const generateUniqueUsername = async (email) => {
  const emailPrefix = email.split("@")[0];
  let baseUsername = emailPrefix.split(".")[0].toLowerCase();

  baseUsername = baseUsername.replace(/[^a-z0-9]/g, "");
  if (baseUsername.length < 3) {
    baseUsername = "user" + baseUsername;
  }

  let username = baseUsername;
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const existingUser = await UserModel.findOne({ username });

    if (!existingUser) {
      return username;
    }

    const randomNumber = Math.floor(Math.random() * 90) + 10;
    username = `${baseUsername}${randomNumber}`;
    attempts++;
  }

  const timestamp = Date.now().toString().slice(-4);
  return `${baseUsername}${timestamp}`;
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not provided by Google",
      });
    }

    let existingUser = await UserModel.findOne({
      $or: [{ email }, { googleId }],
    });

    if (existingUser) {
      if (!existingUser.googleId) {
        existingUser.googleId = googleId;
        await existingUser.save();
      }

      const token = generateToken(existingUser.username, existingUser._id);
      res.cookie("jwt", token, cookieOptions);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          _id: existingUser._id,
          username: existingUser.username,
          nickname: existingUser.nickname,
          email: existingUser.email,
          avatar: existingUser.avatar,
          avatarData: existingUser.avatarData,
          isMatchable: existingUser.isMatchable,
          aboutMe: existingUser.aboutMe,
          country: existingUser.country,
          city: existingUser.city,
          age: existingUser.age,
          status: existingUser.status,
          devExperience: existingUser.devExperience,
          techArea: existingUser.techArea,
          favoriteTimeToCode: existingUser.favoriteTimeToCode,
          favoriteLineOfCode: existingUser.favoriteLineOfCode,
          programmingLanguages: existingUser.programmingLanguages,
          techStack: existingUser.techStack,
          preferredOS: existingUser.preferredOS,
          languages: existingUser.languages,
          gaming: existingUser.gaming,
          otherInterests: existingUser.otherInterests,
          favoriteDrinkWhileCoding: existingUser.favoriteDrinkWhileCoding,
          musicGenreWhileCoding: existingUser.musicGenreWhileCoding,
          favoriteShowMovie: existingUser.favoriteShowMovie,
          linkedinProfile: existingUser.linkedinProfile,
          githubProfile: existingUser.githubProfile,
          personalWebsites: existingUser.personalWebsites,
          profileLinksVisibleToContacts:
            existingUser.profileLinksVisibleToContacts,
          points: existingUser.points,
          rating: existingUser.rating,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
        isNewUser: false,
      });
    } else {
      const username = await generateUniqueUsername(email);

      let finalAvatar = picture;
      let avatarData = null;

      if (picture) {
        try {
          const pixelResult = await pixelizeImageFromUrl(picture, 16);
          const imageBuffer = dataUrlToBuffer(pixelResult.imageDataUrl);

          const folder = `avatars/${username}`;
          const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: folder,
                  resource_type: "image",
                  allowed_formats: ["png"],
                  transformation: [
                    { width: 400, height: 400, crop: "fill" },
                    { quality: "auto" },
                    { fetch_format: "auto" },
                  ],
                },
                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              )
              .end(imageBuffer);
          });

          finalAvatar = cloudinaryResult.secure_url;
          avatarData = JSON.stringify(pixelResult.pixels);
        } catch (pixelError) {
          finalAvatar = picture;
        }
      }

      const newUser = new UserModel({
        email,
        username,
        nickname: name || username,
        googleId,
        avatar: finalAvatar,
        avatarData: avatarData,
        isMatchable: false,
      });

      await newUser.save();

      const token = generateToken(username, newUser._id);
      res.cookie("jwt", token, cookieOptions);

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        user: {
          _id: newUser._id,
          username: newUser.username,
          nickname: newUser.nickname,
          email: newUser.email,
          avatar: newUser.avatar,
          avatarData: newUser.avatarData,
          isMatchable: false,
        },
        isNewUser: true,
      });
    }
  } catch (error) {
    if (error.message.includes("Token used too late")) {
      return res.status(400).json({
        success: false,
        message: "Google token has expired. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

export const githubAuth = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "GitHub authorization code is required",
      });
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({
        success: false,
        message: tokenData.error_description || "GitHub authentication failed",
      });
    }

    const githubUser = await getGitHubUserData(tokenData.access_token);

    if (!githubUser.email) {
      return res.status(400).json({
        success: false,
        message: "Email not provided by GitHub",
      });
    }

    let existingUser = await UserModel.findOne(
      {
        $or: [{ email: githubUser.email }, { githubId: githubUser.id }],
      },
      { contacts: 0 }
    );

    if (existingUser) {
      try {
        await UserModel.updateOne(
          { _id: existingUser._id },
          { $set: { contacts: [] } }
        );
      } catch (contactsError) {}

      if (!existingUser.githubId) {
        existingUser.githubId = githubUser.id;
        await existingUser.save();
      }

      if (githubUser.avatar_url && !existingUser.avatarData) {
        try {
          const pixelResult = await pixelizeImageFromUrl(
            githubUser.avatar_url,
            16
          );
          const imageBuffer = dataUrlToBuffer(pixelResult.imageDataUrl);

          const folder = `avatars/${existingUser.username}`;
          const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: folder,
                  resource_type: "image",
                  allowed_formats: ["png"],
                  transformation: [
                    { width: 400, height: 400, crop: "fill" },
                    { quality: "auto" },
                    { fetch_format: "auto" },
                  ],
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              )
              .end(imageBuffer);
          });

          existingUser.avatar = cloudinaryResult.secure_url;
          existingUser.avatarData = pixelResult.pixelsData;
          await existingUser.save();
        } catch (pixelError) {}
      }

      const token = generateToken(existingUser.username, existingUser._id);
      res.cookie("jwt", token, cookieOptions);

      const isProfileComplete =
        existingUser.programmingLanguages &&
        existingUser.programmingLanguages.length > 0;

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          _id: existingUser._id,
          username: existingUser.username,
          nickname: existingUser.nickname,
          email: existingUser.email,
          avatar: existingUser.avatar,
          avatarData: existingUser.avatarData,
          isMatchable: existingUser.isMatchable,
          aboutMe: existingUser.aboutMe,
          country: existingUser.country,
          city: existingUser.city,
          age: existingUser.age,
          status: existingUser.status,
          devExperience: existingUser.devExperience,
          techArea: existingUser.techArea,
          favoriteTimeToCode: existingUser.favoriteTimeToCode,
          favoriteLineOfCode: existingUser.favoriteLineOfCode,
          programmingLanguages: existingUser.programmingLanguages,
          techStack: existingUser.techStack,
          preferredOS: existingUser.preferredOS,
          languages: existingUser.languages,
          gaming: existingUser.gaming,
          otherInterests: existingUser.otherInterests,
          favoriteDrinkWhileCoding: existingUser.favoriteDrinkWhileCoding,
          musicGenreWhileCoding: existingUser.musicGenreWhileCoding,
          favoriteShowMovie: existingUser.favoriteShowMovie,
          linkedinProfile: existingUser.linkedinProfile,
          githubProfile: existingUser.githubProfile,
          personalWebsites: existingUser.personalWebsites,
          profileLinksVisibleToContacts:
            existingUser.profileLinksVisibleToContacts,
          points: existingUser.points,
          rating: existingUser.rating,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
        isNewUser: !isProfileComplete,
      });
    } else {
      const username = await generateUniqueUsername(githubUser.email);

      let finalAvatar = githubUser.avatar_url;
      let avatarData = null;

      if (githubUser.avatar_url) {
        try {
          const pixelResult = await pixelizeImageFromUrl(
            githubUser.avatar_url,
            16
          );
          const imageBuffer = dataUrlToBuffer(pixelResult.imageDataUrl);

          const folder = `avatars/${username}`;
          const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: folder,
                  resource_type: "image",
                  allowed_formats: ["png"],
                  transformation: [
                    { width: 400, height: 400, crop: "fill" },
                    { quality: "auto" },
                    { fetch_format: "auto" },
                  ],
                },
                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              )
              .end(imageBuffer);
          });

          finalAvatar = cloudinaryResult.secure_url;
          avatarData = JSON.stringify(pixelResult.pixels);
        } catch (pixelError) {
          finalAvatar = githubUser.avatar_url;
        }
      }

      const newUser = new UserModel({
        email: githubUser.email,
        username,
        nickname: githubUser.name || username,
        githubId: githubUser.id,
        avatar: finalAvatar,
        avatarData: avatarData,
        isMatchable: false,
        githubProfile: `https://github.com/${githubUser.username}`,
      });

      await newUser.save();

      const token = generateToken(username, newUser._id);
      res.cookie("jwt", token, cookieOptions);

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        user: {
          _id: newUser._id,
          username: newUser.username,
          nickname: newUser.nickname,
          email: newUser.email,
          avatar: newUser.avatar,
          avatarData: newUser.avatarData,
          isMatchable: false,
          githubProfile: newUser.githubProfile,
        },
        isNewUser: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "GitHub authentication failed",
    });
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const hashedPassword = await hashPassword(password);

    let newAccount = new UserModel({
      email,
      hashedPassword,
      username,
      nickname: username,
      isMatchable: false,
    });

    await newAccount.save();

    let avatarUrl = null;
    let avatarData = null;

    try {
      const randomAvatarResult = await generateAndUploadRandomAvatar(
        newAccount._id,
        cloudinary,
        16
      );
      avatarUrl = randomAvatarResult.avatarUrl;
      avatarData = randomAvatarResult.avatarData;

      newAccount.avatar = avatarUrl;
      newAccount.avatarData = avatarData;
      await newAccount.save();
    } catch (avatarError) {}

    const token = generateToken(username, newAccount._id);
    res.cookie("jwt", token, cookieOptions);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newAccount._id,
        username: newAccount.username,
        nickname: newAccount.nickname,
        email: newAccount.email,
        isMatchable: false,
        avatar: newAccount.avatar || null,
        avatarData: newAccount.avatarData || null,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    if (updates.hashedPassword || updates.password) {
      const existingUser = await UserModel.findById(userId);
      if (existingUser && (existingUser.googleId || existingUser.githubId)) {
        delete updates.hashedPassword;
        delete updates.password;
      }
    }

    if (updates.age !== undefined) {
      if (updates.age === "" || updates.age === null || isNaN(updates.age)) {
        updates.age = null;
      } else {
        updates.age = Number(updates.age);
      }
    }

    if (updates.rating !== undefined) {
      if (
        updates.rating === "" ||
        updates.rating === null ||
        isNaN(updates.rating)
      ) {
        updates.rating = null;
      } else {
        updates.rating = Number(updates.rating);
      }
    }

    if (updates.points !== undefined) {
      if (
        updates.points === "" ||
        updates.points === null ||
        isNaN(updates.points)
      ) {
        updates.points = 0;
      } else {
        updates.points = Number(updates.points);
      }
    }

    [
      "techArea",
      "languages",
      "techStack",
      "otherInterests",
      "personalWebsites",
    ].forEach((field) => {
      if (updates[field] && Array.isArray(updates[field])) {
        updates[field] = updates[field].filter(
          (item) => item && item.trim && item.trim() !== ""
        );
      }
    });

    if (
      updates.programmingLanguages &&
      Array.isArray(updates.programmingLanguages)
    ) {
      updates.programmingLanguages = updates.programmingLanguages
        .filter(
          (item) =>
            Array.isArray(item) &&
            item.length === 2 &&
            item[0] &&
            item[0].trim() !== ""
        )
        .map((item) => [item[0], Number(item[1])]);
    }

    if (updates.password && updates.password.trim() !== "") {
      updates.hashedPassword = await hashPassword(updates.password);
      delete updates.password;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isNowMatchable = checkIsMatchable(updatedUser);
    if (isNowMatchable !== updatedUser.isMatchable) {
      updatedUser.isMatchable = isNowMatchable;
      runMatchingForAllUsers();
      await updatedUser.save();
    }

    const cleanUserData = {
      _id: updatedUser._id,
      username: updatedUser.username,
      nickname: updatedUser.nickname,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      avatarData: updatedUser.avatarData,
      isMatchable: updatedUser.isMatchable,
      aboutMe: updatedUser.aboutMe,
      country: updatedUser.country,
      city: updatedUser.city,
      age: updatedUser.age,
      status: updatedUser.status,
      devExperience: updatedUser.devExperience,
      techArea: updatedUser.techArea,
      favoriteTimeToCode: updatedUser.favoriteTimeToCode,
      programmingLanguages: updatedUser.programmingLanguages,
      languages: updatedUser.languages,
      techStack: updatedUser.techStack,
      otherInterests: updatedUser.otherInterests,
      personalWebsites: updatedUser.personalWebsites,
      isOnline: updatedUser.isOnline,
      lastSeen: updatedUser.lastSeen,
      rating: updatedUser.rating,
      points: updatedUser.points,
      googleId: updatedUser.googleId,
      githubId: updatedUser.githubId,
    };

    return res.status(200).json({
      success: true,
      user: cleanUserData,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } already exists`,
      });
    }

    return next(error);
  }
};

export const verifyLogin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier) {
      const error = new Error("Email or username is required");
      error.statusCode = 400;
      return next(error);
    }

    const isEmail = identifier.includes("@");
    const query = isEmail ? { email: identifier } : { username: identifier };

    const existingUser = await UserModel.findOne(query);

    if (!existingUser) {
      const error = new Error("User does not exist");
      error.statusCode = 404;
      return next(error);
    }

    const passwordMatch = await comparePassword(
      password,
      existingUser.hashedPassword
    );

    if (!passwordMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      return next(error);
    }

    const isNowMatchable = checkIsMatchable(existingUser);
    if (isNowMatchable !== existingUser.isMatchable) {
      existingUser.isMatchable = isNowMatchable;
      await existingUser.save();
    }

    const token = generateToken(existingUser.username, existingUser._id);
    res.cookie("jwt", token, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: existingUser._id,
        username: existingUser.username,
        nickname: existingUser.nickname,
        email: existingUser.email,
        isMatchable: existingUser.isMatchable,
        avatar: existingUser.avatar,
        avatarData: existingUser.avatarData,
        aboutMe: existingUser.aboutMe,
        country: existingUser.country,
        city: existingUser.city,
        age: existingUser.age,
        status: existingUser.status,
        devExperience: existingUser.devExperience,
        techArea: existingUser.techArea,
        favoriteTimeToCode: existingUser.favoriteTimeToCode,
        favoriteLineOfCode: existingUser.favoriteLineOfCode,
        programmingLanguages: existingUser.programmingLanguages,
        techStack: existingUser.techStack,
        preferredOS: existingUser.preferredOS,
        languages: existingUser.languages,
        gaming: existingUser.gaming,
        otherInterests: existingUser.otherInterests,
        favoriteDrinkWhileCoding: existingUser.favoriteDrinkWhileCoding,
        musicGenreWhileCoding: existingUser.musicGenreWhileCoding,
        favoriteShowMovie: existingUser.favoriteShowMovie,
        linkedinProfile: existingUser.linkedinProfile,
        githubProfile: existingUser.githubProfile,
        personalWebsites: existingUser.personalWebsites,
        profileLinksVisibleToContacts:
          existingUser.profileLinksVisibleToContacts,
        isOnline: existingUser.isOnline,
        lastSeen: existingUser.lastSeen,
        points: existingUser.points,
        rating: existingUser.rating,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId).select("-hashedPassword");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      message: "User data retrieved successfully",
      user: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        avatarData: user.avatarData,
        aboutMe: user.aboutMe,
        country: user.country,
        city: user.city,
        age: user.age,
        status: user.status,
        devExperience: user.devExperience,
        techArea: user.techArea,
        favoriteTimeToCode: user.favoriteTimeToCode,
        favoriteLineOfCode: user.favoriteLineOfCode,
        programmingLanguages: user.programmingLanguages,
        techStack: user.techStack,
        preferredOS: user.preferredOS,
        languages: user.languages,
        gaming: user.gaming,
        otherInterests: user.otherInterests,
        favoriteDrinkWhileCoding: user.favoriteDrinkWhileCoding,
        musicGenreWhileCoding: user.musicGenreWhileCoding,
        favoriteShowMovie: user.favoriteShowMovie,
        linkedinProfile: user.linkedinProfile,
        githubProfile: user.githubProfile,
        personalWebsites: user.personalWebsites,
        profileLinksVisibleToContacts: user.profileLinksVisibleToContacts,
        isMatchable: user.isMatchable,
        rating: user.rating,
        points: user.points,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user._id;

    const targetUser = await UserModel.findById(userId).select(
      "-hashedPassword"
    );

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userId === requestingUserId.toString()) {
      return res.status(200).json({
        success: true,
        message: "Own profile data retrieved successfully",
        user: {
          _id: targetUser._id,
          username: targetUser.username,
          nickname: targetUser.nickname,
          email: targetUser.email,
          avatar: targetUser.avatar,
          avatarData: targetUser.avatarData,
          aboutMe: targetUser.aboutMe,
          country: targetUser.country,
          city: targetUser.city,
          age: targetUser.age,
          status: targetUser.status,
          devExperience: targetUser.devExperience,
          techArea: targetUser.techArea,
          favoriteTimeToCode: targetUser.favoriteTimeToCode,
          favoriteLineOfCode: targetUser.favoriteLineOfCode,
          programmingLanguages: targetUser.programmingLanguages,
          techStack: targetUser.techStack,
          preferredOS: targetUser.preferredOS,
          languages: targetUser.languages,
          gaming: targetUser.gaming,
          otherInterests: targetUser.otherInterests,
          favoriteDrinkWhileCoding: targetUser.favoriteDrinkWhileCoding,
          musicGenreWhileCoding: targetUser.musicGenreWhileCoding,
          favoriteShowMovie: targetUser.favoriteShowMovie,
          linkedinProfile: targetUser.linkedinProfile,
          githubProfile: targetUser.githubProfile,
          personalWebsites: targetUser.personalWebsites,
          profileLinksVisibleToContacts:
            targetUser.profileLinksVisibleToContacts,
          isMatchable: targetUser.isMatchable,
          rating: targetUser.rating,
          points: targetUser.points,
          isOnline: targetUser.isOnline,
          lastSeen: targetUser.lastSeen,
          createdAt: targetUser.createdAt,
          updatedAt: targetUser.updatedAt,
        },
        isOwnProfile: true,
        isContact: true,
      });
    }

    const isContact = targetUser.contacts.some(
      (contactId) => contactId.toString() === requestingUserId.toString()
    );

    if (isContact) {
      const contactProfile = {
        _id: targetUser._id,
        username: targetUser.username,
        nickname: targetUser.nickname,
        avatar: targetUser.avatar,
        aboutMe: targetUser.aboutMe,
        country: targetUser.country,
        city: targetUser.city,
        age: targetUser.age,
        status: targetUser.status,
        devExperience: targetUser.devExperience,
        techArea: targetUser.techArea,
        favoriteTimeToCode: targetUser.favoriteTimeToCode,
        favoriteLineOfCode: targetUser.favoriteLineOfCode,
        programmingLanguages: targetUser.programmingLanguages,
        techStack: targetUser.techStack,
        preferredOS: targetUser.preferredOS,
        languages: targetUser.languages,
        gaming: targetUser.gaming,
        otherInterests: targetUser.otherInterests,
        favoriteDrinkWhileCoding: targetUser.favoriteDrinkWhileCoding,
        musicGenreWhileCoding: targetUser.musicGenreWhileCoding,
        favoriteShowMovie: targetUser.favoriteShowMovie,
        profileLinksVisibleToContacts: targetUser.profileLinksVisibleToContacts,
        isMatchable: targetUser.isMatchable,
        rating: targetUser.rating,
        points: targetUser.points,
        isOnline: targetUser.isOnline,
        lastSeen: targetUser.lastSeen,
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt,
      };

      if (targetUser.profileLinksVisibleToContacts) {
        contactProfile.linkedinProfile = targetUser.linkedinProfile;
        contactProfile.githubProfile = targetUser.githubProfile;
        contactProfile.personalWebsites = targetUser.personalWebsites;
      }

      return res.status(200).json({
        success: true,
        message: "Contact profile data retrieved successfully",
        user: contactProfile,
        isOwnProfile: false,
        isContact: true,
      });
    } else {
      const publicProfile = {
        _id: targetUser._id,
        username: targetUser.username,
        nickname: targetUser.nickname,
        avatar: targetUser.avatar,
        status: targetUser.status,
        aboutMe: targetUser.aboutMe,
        country: targetUser.country,
        programmingLanguages: targetUser.programmingLanguages,
        techStack: targetUser.techStack,
        techArea: targetUser.techArea,
        languages: targetUser.languages,
        preferredOS: targetUser.preferredOS,
        createdAt: targetUser.createdAt,
        profileLinksVisibleToContacts: targetUser.profileLinksVisibleToContacts,
      };

      if (targetUser.profileLinksVisibleToContacts) {
        publicProfile.linkedinProfile = targetUser.linkedinProfile;
        publicProfile.githubProfile = targetUser.githubProfile;
        publicProfile.personalWebsites = targetUser.personalWebsites;
      }

      return res.status(200).json({
        success: true,
        message: "Public profile data retrieved successfully",
        user: publicProfile,
        isOwnProfile: false,
        isContact: false,
      });
    }
  } catch (error) {
    return next(error);
  }
};

export const getUserContacts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId)
      .populate({
        path: "contacts",
        select: "username nickname avatar isOnline lastSeen",
        options: {
          sort: {
            isOnline: -1,
            lastSeen: -1,
          },
        },
      })
      .select("contacts");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const formattedContacts = user.contacts.map((contact) => ({
      _id: contact._id,
      username: contact.username,
      nickname: contact.nickname,
      avatar: contact.avatar,
      isOnline: contact.isOnline,
      lastSeen: contact.lastSeen,
    }));

    return res.status(200).json({
      success: true,
      message: "User contacts retrieved successfully",
      contacts: formattedContacts,
      totalContacts: formattedContacts.length,
    });
  } catch (error) {
    return next(error);
  }
};
