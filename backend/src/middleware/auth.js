import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";
import { generateToken } from "../libs/jwt.js";

export const authorizeJwt = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const isVerified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await UserModel.findById(isVerified.id);

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        decoded = jwt.decode(token);
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
    }

    const user = await UserModel.findById(decoded.id).select("-hashedPassword");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const newToken = generateToken(user.username, user._id);

    res.cookie("jwt", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isMatchable: user.isMatchable,
        avatar: user.avatar,
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
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        points: user.points,
        rating: user.rating,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const checkAuthStatus = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id).select("-hashedPassword");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Authenticated",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isMatchable: user.isMatchable,
        avatar: user.avatar,
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
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        points: user.points,
        rating: user.rating,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
};
