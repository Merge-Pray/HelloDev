import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";
import { generateToken } from "../libs/jwt.js";
import { verifyTokenAndGetUser } from "../libs/authHelpers.js";
import { getUniversalCookieOptions } from "../utils/browserDetection.js";

export const authorizeJwt = async (req, res, next) => {
  try {
    console.log(`🔐 [AUTH] Authorization attempt for ${req.method} ${req.path}`);
    
    const token = req.cookies.jwt;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const isProblematicBrowser = /SamsungBrowser|CriOS/i.test(userAgent);
    
    console.log(`🔐 [AUTH] Browser: ${isProblematicBrowser ? '⚠️ ' : ''}${userAgent.includes('SamsungBrowser') ? 'Samsung' : userAgent.includes('CriOS') ? 'iOS Chrome' : 'Other'}`);
    console.log(`🔐 [AUTH] Token present: ${token ? '✅ Yes' : '❌ No'}`);
    
    if (token) {
      console.log(`🔐 [AUTH] Token length: ${token.length} chars`);
      console.log(`🔐 [AUTH] Token preview: ${token.substring(0, 20)}...`);
    }
    
    const user = await verifyTokenAndGetUser(token);
    req.user = user;
    
    console.log(`🔐 [AUTH] ✅ Success for user: ${user.username} (${user._id})`);
    next();
  } catch (error) {
    console.log(`🔐 [AUTH] ❌ Failed: ${error.message}`);
    return res.status(401).json({ message: "Not authorized" });
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    console.log(`🔄 [REFRESH] Token refresh attempt`);
    const token = req.cookies.jwt;
    
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const isProblematicBrowser = /SamsungBrowser|CriOS/i.test(userAgent);
    console.log(`🔄 [REFRESH] Browser: ${isProblematicBrowser ? '⚠️ ' : ''}${userAgent.includes('SamsungBrowser') ? 'Samsung' : userAgent.includes('CriOS') ? 'iOS Chrome' : 'Other'}`);

    if (!token) {
      console.log(`🔄 [REFRESH] ❌ No token provided`);
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }
    
    console.log(`🔄 [REFRESH] Token present, length: ${token.length} chars`);

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

    console.log(`🔄 [REFRESH] Generating new token for user: ${user.username} (${user._id})`);
    const newToken = generateToken(user.username, user._id);
    console.log(`🔄 [REFRESH] New token generated, length: ${newToken.length} chars`);

    const cookieOptions = getUniversalCookieOptions();
    console.log(`🔄 [REFRESH] Setting new cookie with options:`, cookieOptions);
    
    res.cookie("jwt", newToken, cookieOptions);
    console.log(`🔄 [REFRESH] ✅ Token refreshed successfully for ${user.username}`);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      user: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        isMatchable: user.isMatchable,
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
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        points: user.points,
        rating: user.rating,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const checkAuthStatus = async (req, res, next) => {
  try {
    console.log(`🔍 [AUTH-STATUS] Checking authentication status`);
    const token = req.cookies.jwt;
    
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const isProblematicBrowser = /SamsungBrowser|CriOS/i.test(userAgent);
    console.log(`🔍 [AUTH-STATUS] Browser: ${isProblematicBrowser ? '⚠️ ' : ''}${userAgent.includes('SamsungBrowser') ? 'Samsung' : userAgent.includes('CriOS') ? 'iOS Chrome' : 'Other'}`);

    if (!token) {
      console.log(`🔍 [AUTH-STATUS] ❌ No token provided`);
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    console.log(`🔍 [AUTH-STATUS] Token present, length: ${token.length} chars`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`🔍 [AUTH-STATUS] Token decoded for user ID: ${decoded.id}`);
    
    const user = await UserModel.findById(decoded.id).select("-hashedPassword");

    if (!user) {
      console.log(`🔍 [AUTH-STATUS] ❌ User not found for ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    
    console.log(`🔍 [AUTH-STATUS] ✅ User authenticated: ${user.username} (${user._id})`);

    return res.status(200).json({
      success: true,
      message: "Authenticated",
      user: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        isMatchable: user.isMatchable,
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
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        points: user.points,
        rating: user.rating,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
};
