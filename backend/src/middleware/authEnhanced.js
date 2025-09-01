import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";
import { generateToken } from "../libs/jwt.js";
import { verifyTokenAndGetUser } from "../libs/authHelpers.js";
import { getEnhancedCookieOptions, logBrowserInfo, isSamsungBrowser, isIOSChrome } from "../utils/enhancedBrowserDetection.js";

export const authorizeJwtEnhanced = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const userAgent = req.get('User-Agent');
    
    // Log problematic browsers
    logBrowserInfo(userAgent, req);
    
    const user = await verifyTokenAndGetUser(token);
    req.user = user;
    next();
  } catch (error) {
    const userAgent = req.get('User-Agent');
    
    // For problematic browsers, provide more detailed error info
    if (isSamsungBrowser(userAgent) || isIOSChrome(userAgent)) {
      console.log(`🔍 Auth failed for special browser:`, {
        browser: isSamsungBrowser(userAgent) ? 'Samsung' : 'iOS Chrome',
        hasToken: !!req.cookies.jwt,
        error: error.message
      });
    }
    
    return res.status(401).json({ 
      message: "Not authorized",
      browserType: isSamsungBrowser(userAgent) ? 'samsung' : isIOSChrome(userAgent) ? 'ios-chrome' : 'standard'
    });
  }
};

export const refreshTokenEnhanced = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const userAgent = req.get('User-Agent');
    
    logBrowserInfo(userAgent, req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
        browserType: isSamsungBrowser(userAgent) ? 'samsung' : isIOSChrome(userAgent) ? 'ios-chrome' : 'standard'
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
          browserType: isSamsungBrowser(userAgent) ? 'samsung' : isIOSChrome(userAgent) ? 'ios-chrome' : 'standard'
        });
      }
    }

    const user = await UserModel.findById(decoded.id).select("-hashedPassword");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        browserType: isSamsungBrowser(userAgent) ? 'samsung' : isIOSChrome(userAgent) ? 'ios-chrome' : 'standard'
      });
    }

    const newToken = generateToken(user.username, user._id);

    // Use enhanced cookie options for better mobile compatibility
    const cookieOptions = getEnhancedCookieOptions(userAgent, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    // For Samsung browsers, try multiple cookie setting approaches
    if (isSamsungBrowser(userAgent)) {
      // Set cookie with different approaches for Samsung compatibility
      res.cookie("jwt", newToken, cookieOptions);
      
      // Also try setting without httpOnly as fallback (less secure but more compatible)
      res.cookie("jwt_fallback", newToken, {
        ...cookieOptions,
        httpOnly: false,
        maxAge: 5 * 60 * 1000 // 5 minutes only for fallback
      });
    } else {
      res.cookie("jwt", newToken, cookieOptions);
    }

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      browserType: isSamsungBrowser(userAgent) ? 'samsung' : isIOSChrome(userAgent) ? 'ios-chrome' : 'standard',
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
    console.error('Token refresh error:', error);
    return next(error);
  }
};

export const checkAuthStatusEnhanced = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const userAgent = req.get('User-Agent');
    
    logBrowserInfo(userAgent, req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
        browserType: isSamsungBrowser(userAgent) ? 'samsung' : isIOSChrome(userAgent) ? 'ios-chrome' : 'standard'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // For Samsung browsers, also check fallback cookie
      if (isSamsungBrowser(userAgent) && req.cookies.jwt_fallback) {
        try {
          decoded = jwt.verify(req.cookies.jwt_fallback, process.env.JWT_SECRET);
          console.log('🔍 Samsung Browser - Using fallback cookie');
        } catch (fallbackError) {
          return res.status(401).json({
            success: false,
            message: "Not authenticated",
            browserType: 'samsung'
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
          browserType: isSamsungBrowser(userAgent) ? 'samsung' : isIOSChrome(userAgent) ? 'ios-chrome' : 'standard'
        });
      }
    }

    const user = await UserModel.findById(decoded.id).select("-hashedPassword");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        browserType: isSamsungBrowser(userAgent) ? 'samsung' : isIOSChrome(userAgent) ? 'ios-chrome' : 'standard'
      });
    }

    return res.status(200).json({
      success: true,
      message: "Authenticated",
      browserType: isSamsungBrowser(userAgent) ? 'samsung' : isIOSChrome(userAgent) ? 'ios-chrome' : 'standard',
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
    console.error('Auth status check error:', error);
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
      browserType: isSamsungBrowser(req.get('User-Agent')) ? 'samsung' : isIOSChrome(req.get('User-Agent')) ? 'ios-chrome' : 'standard'
    });
  }
};