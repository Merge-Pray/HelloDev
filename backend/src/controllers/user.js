import checkIsMatchable from "../../utils/profileValidator.js";
import { generateToken } from "../libs/jwt.js";
import { hashPassword, comparePassword } from "../libs/pw.js";
import UserModel from "../models/user.js";
import { getUniversalCookieOptions } from "../utils/browserDetection.js";
import { OAuth2Client } from 'google-auth-library';
import { pixelizeImageFromUrl, dataUrlToBuffer, generateAndUploadRandomAvatar } from '../utils/imagePixelizer.js';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// GitHub OAuth helper function
const getGitHubUserData = async (accessToken) => {
  try {
    // Get user basic info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'HelloDev-App'
      }
    });
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch GitHub user data');
    }
    
    const userData = await userResponse.json();
    
    // Get user email (might be private)
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'HelloDev-App'
      }
    });
    
    let email = userData.email;
    if (!email && emailResponse.ok) {
      const emails = await emailResponse.json();
      const primaryEmail = emails.find(e => e.primary && e.verified);
      email = primaryEmail ? primaryEmail.email : emails[0]?.email;
    }
    
    return {
      id: userData.id.toString(),
      email: email,
      name: userData.name || userData.login,
      username: userData.login,
      avatar_url: userData.avatar_url
    };
  } catch (error) {
    console.error('Error fetching GitHub user data:', error);
    throw error;
  }
};

// Hilfsfunktion zum Generieren eines eindeutigen Usernamens
const generateUniqueUsername = async (email) => {
  // Extrahiere den Teil vor dem ersten Punkt oder @
  const emailPrefix = email.split('@')[0];
  let baseUsername = emailPrefix.split('.')[0].toLowerCase();
  
  // Entferne ungültige Zeichen und stelle sicher, dass es mindestens 3 Zeichen hat
  baseUsername = baseUsername.replace(/[^a-z0-9]/g, '');
  if (baseUsername.length < 3) {
    baseUsername = 'user' + baseUsername;
  }
  
  let username = baseUsername;
  let attempts = 0;
  const maxAttempts = 100;
  
  // Prüfe ob Username bereits existiert
  while (attempts < maxAttempts) {
    const existingUser = await UserModel.findOne({ username });
    
    if (!existingUser) {
      return username;
    }
    
    // Füge 2-stellige Zufallszahl hinzu
    const randomNumber = Math.floor(Math.random() * 90) + 10; // 10-99
    username = `${baseUsername}${randomNumber}`;
    attempts++;
  }
  
  // Fallback wenn alle Versuche fehlschlagen
  const timestamp = Date.now().toString().slice(-4);
  return `${baseUsername}${timestamp}`;
};

export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verifiziere das Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not provided by Google'
      });
    }

    // Prüfe ob User bereits existiert (per Email oder Google ID)
    let existingUser = await UserModel.findOne({
      $or: [{ email }, { googleId }]
    });

    if (existingUser) {
      // User existiert bereits - Anmeldung
      
      // Update Google ID falls noch nicht gesetzt
      if (!existingUser.googleId) {
        existingUser.googleId = googleId;
        await existingUser.save();
      }
      
      const token = generateToken(existingUser.username, existingUser._id);
      const cookieOptions = getUniversalCookieOptions();
      res.cookie('jwt', token, cookieOptions);
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
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
          profileLinksVisibleToContacts: existingUser.profileLinksVisibleToContacts,
          points: existingUser.points,
          rating: existingUser.rating,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
        isNewUser: false
      });
    } else {
      // Neuer User - Registrierung mit Bildpixelisierung
      
      const username = await generateUniqueUsername(email);
      
      let finalAvatar = picture;
      let avatarData = null;
      
      // Versuche das Google-Profilbild zu pixelisieren
      if (picture) {
        try {
          console.log('🎨 Starting Google profile picture pixelization...');
          
          // Pixelisiere das Google-Bild
          const pixelResult = await pixelizeImageFromUrl(picture, 16);
          
          // Konvertiere DataURL zu Buffer
          const imageBuffer = dataUrlToBuffer(pixelResult.imageDataUrl);
          
          // Upload zu Cloudinary
          const folder = `avatars/${username}`;
          const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: folder,
                resource_type: 'image',
                allowed_formats: ['png'],
                transformation: [
                  { width: 400, height: 400, crop: 'fill' },
                  { quality: 'auto' },
                  { fetch_format: 'auto' },
                ],
              },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            ).end(imageBuffer);
          });
          
          finalAvatar = cloudinaryResult.secure_url;
          avatarData = JSON.stringify(pixelResult.pixels);
          
          console.log('✅ Google profile picture successfully pixelized and uploaded');
          
        } catch (pixelError) {
          console.error('❌ Error pixelizing Google profile picture:', pixelError);
          console.log('📝 Falling back to original Google picture');
          // Fallback: Use original Google picture
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
      const cookieOptions = getUniversalCookieOptions();
      res.cookie('jwt', token, cookieOptions);
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          _id: newUser._id,
          username: newUser.username,
          nickname: newUser.nickname,
          email: newUser.email,
          avatar: newUser.avatar,
          avatarData: newUser.avatarData,
          isMatchable: false,
        },
        isNewUser: true
      });
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    
    if (error.message.includes('Token used too late')) {
      return res.status(400).json({
        success: false,
        message: 'Google token has expired. Please try again.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
};

export const githubAuth = async (req, res, next) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'GitHub authorization code is required'
      });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return res.status(400).json({
        success: false,
        message: tokenData.error_description || 'GitHub authentication failed'
      });
    }

    // Get user data from GitHub
    const githubUser = await getGitHubUserData(tokenData.access_token);
    
    if (!githubUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Email not provided by GitHub'
      });
    }

    // Check if user already exists (by email or GitHub ID)
    // Exclude the contacts field temporarily to avoid the casting error
    let existingUser = await UserModel.findOne({
      $or: [{ email: githubUser.email }, { githubId: githubUser.id }]
    }, { contacts: 0 }); // Exclude contacts field from the query

    if (existingUser) {
      // User exists - Login
      
      // Fix corrupted contacts field in database
      try {
        await UserModel.updateOne(
          { _id: existingUser._id },
          { $set: { contacts: [] } }
        );
        console.log('🔧 Fixed corrupted contacts field for user:', existingUser.email);
      } catch (contactsError) {
        console.log('⚠️ Could not fix contacts field, but continuing...');
      }
      
      // Update GitHub ID if not set
      if (!existingUser.githubId) {
        existingUser.githubId = githubUser.id;
        await existingUser.save();
      }
      
      // Update GitHub profile picture if user doesn't have avatarData (pixel avatar)
      if (githubUser.avatar_url && !existingUser.avatarData) {
        try {
          console.log('🎨 Updating GitHub profile picture for existing user...');
          
          // Pixelize GitHub image
          const pixelResult = await pixelizeImageFromUrl(githubUser.avatar_url, 16);
          
          // Convert DataURL to Buffer
          const imageBuffer = dataUrlToBuffer(pixelResult.imageDataUrl);
          
          // Upload to Cloudinary
          const folder = `avatars/${existingUser.username}`;
          const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: folder,
                resource_type: 'image',
                allowed_formats: ['png'],
                transformation: [
                  { width: 400, height: 400, crop: 'fill' },
                  { quality: 'auto' },
                  { fetch_format: 'auto' },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(imageBuffer);
          });
          
          // Update user with new avatar
          existingUser.avatar = cloudinaryResult.secure_url;
          existingUser.avatarData = pixelResult.pixelsData;
          await existingUser.save();
          
          console.log('✅ GitHub profile picture updated for existing user');
        } catch (pixelError) {
          console.error('❌ Error updating GitHub profile picture for existing user:', pixelError);
          // Continue without updating avatar
        }
      }
      
      const token = generateToken(existingUser.username, existingUser._id);
      const cookieOptions = getUniversalCookieOptions();
      res.cookie('jwt', token, cookieOptions);
      
      // Check if user profile is complete to determine if they should go to buildprofile
      // A profile is considered complete if user has basic info filled out
      const isProfileComplete = existingUser.programmingLanguages && 
                               existingUser.programmingLanguages.length > 0;
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
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
          profileLinksVisibleToContacts: existingUser.profileLinksVisibleToContacts,
          points: existingUser.points,
          rating: existingUser.rating,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
        isNewUser: !isProfileComplete // Send user to buildprofile if profile is incomplete
      });
    } else {
      // New user - Registration with image pixelization
      
      const username = await generateUniqueUsername(githubUser.email);
      
      let finalAvatar = githubUser.avatar_url;
      let avatarData = null;
      
      // Try to pixelize GitHub profile picture
      if (githubUser.avatar_url) {
        try {
          console.log('🎨 Starting GitHub profile picture pixelization...');
          
          // Pixelize GitHub image
          const pixelResult = await pixelizeImageFromUrl(githubUser.avatar_url, 16);
          
          // Convert DataURL to Buffer
          const imageBuffer = dataUrlToBuffer(pixelResult.imageDataUrl);
          
          // Upload to Cloudinary
          const folder = `avatars/${username}`;
          const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: folder,
                resource_type: 'image',
                allowed_formats: ['png'],
                transformation: [
                  { width: 400, height: 400, crop: 'fill' },
                  { quality: 'auto' },
                  { fetch_format: 'auto' },
                ],
              },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            ).end(imageBuffer);
          });
          
          finalAvatar = cloudinaryResult.secure_url;
          avatarData = JSON.stringify(pixelResult.pixels);
          
          console.log('✅ GitHub profile picture successfully pixelized and uploaded');
          
        } catch (pixelError) {
          console.error('❌ Error pixelizing GitHub profile picture:', pixelError);
          console.log('📝 Falling back to original GitHub picture');
          // Fallback: Use original GitHub picture
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
        // Pre-fill GitHub profile link if available
        githubProfile: `https://github.com/${githubUser.username}`,
      });

      await newUser.save();
      
      const token = generateToken(username, newUser._id);
      const cookieOptions = getUniversalCookieOptions();
      res.cookie('jwt', token, cookieOptions);
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
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
        isNewUser: true
      });
    }
  } catch (error) {
    console.error('GitHub Auth Error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'GitHub authentication failed'
    });
  }
};

export const createUser = async (req, res, next) => {
  try {
    console.log('🔧 Creating new user with automatic random avatar...');
    const { email, password, username } = req.body;

    const hashedPassword = await hashPassword(password);

    // Create user first without avatar
    let newAccount = new UserModel({
      email,
      hashedPassword,
      username,
      nickname: username,
      isMatchable: false,
    });

    await newAccount.save();
    console.log('✅ User created, now generating random avatar...');

    // Generate and upload random avatar
    let avatarUrl = null;
    let avatarData = null;
    
    try {
      const randomAvatarResult = await generateAndUploadRandomAvatar(newAccount._id, cloudinary, 16);
      avatarUrl = randomAvatarResult.avatarUrl;
      avatarData = randomAvatarResult.avatarData;
      
      // Update user with avatar data
      newAccount.avatar = avatarUrl;
      newAccount.avatarData = avatarData;
      await newAccount.save();
      
      console.log('✅ Random avatar generated and saved for new user');
      
    } catch (avatarError) {
      console.error('❌ Error generating random avatar for new user:', avatarError);
      console.log('📝 User created without avatar, continuing registration...');
      // Continue without avatar - user can create one later
    }

    const token = generateToken(username, newAccount._id);
    const cookieOptions = getUniversalCookieOptions();
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

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    console.log("🔄 Updating profile for user:", userId);
    console.log("📝 Profile updates:", updates);

    // Check if user is trying to update password but is a OAuth user
    if (updates.hashedPassword || updates.password) {
      const existingUser = await UserModel.findById(userId);
      if (existingUser && (existingUser.googleId || existingUser.githubId)) {
        const provider = existingUser.googleId ? 'Google' : 'GitHub';
        console.log(`⚠️ ${provider} user tried to update password - removing password from updates`);
        // Remove password-related fields from updates but continue with other updates
        delete updates.hashedPassword;
        delete updates.password;
      }
    }

    // Clean up numeric fields - convert empty strings to null or undefined
    if (updates.age !== undefined) {
      if (updates.age === "" || updates.age === null || isNaN(updates.age)) {
        updates.age = null;
      } else {
        updates.age = Number(updates.age);
      }
    }

    if (updates.rating !== undefined) {
      if (updates.rating === "" || updates.rating === null || isNaN(updates.rating)) {
        updates.rating = null;
      } else {
        updates.rating = Number(updates.rating);
      }
    }

    if (updates.points !== undefined) {
      if (updates.points === "" || updates.points === null || isNaN(updates.points)) {
        updates.points = 0;
      } else {
        updates.points = Number(updates.points);
      }
    }

    // Clean up array fields
    ['techArea', 'languages', 'techStack', 'otherInterests', 'personalWebsites'].forEach(field => {
      if (updates[field] && Array.isArray(updates[field])) {
        updates[field] = updates[field].filter(item => item && item.trim && item.trim() !== '');
      }
    });

    // Special handling for programmingLanguages array of arrays
    if (updates.programmingLanguages && Array.isArray(updates.programmingLanguages)) {
      updates.programmingLanguages = updates.programmingLanguages.filter(item => 
        Array.isArray(item) && item.length === 2 && item[0] && item[0].trim() !== ''
      ).map(item => [item[0], Number(item[1])]);
    }

    // Password processing for regular users only
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

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Profile update error:", error);
    console.error("Error details:", error.message);
    console.error("Error name:", error.name);
    if (error.errors) {
      console.error("Validation errors:", error.errors);
    }
    
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      console.error("Formatted validation errors:", validationErrors);
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

    console.log(`🔑 [LOGIN] Generating token for user: ${existingUser.username} (${existingUser._id})`);
    const token = generateToken(existingUser.username, existingUser._id);
    console.log(`🔑 [LOGIN] Token generated, length: ${token.length} chars`);
    console.log(`🔑 [LOGIN] Token preview: ${token.substring(0, 20)}...`);

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const isProblematicBrowser = /SamsungBrowser|CriOS/i.test(userAgent);
    console.log(`🔑 [LOGIN] Setting cookie for browser: ${isProblematicBrowser ? '⚠️ ' : ''}${userAgent.includes('SamsungBrowser') ? 'Samsung' : userAgent.includes('CriOS') ? 'iOS Chrome' : 'Other'}`);
    
    const cookieOptions = getUniversalCookieOptions({}, userAgent);
    console.log(`🔑 [LOGIN] Cookie options:`, cookieOptions);

    res.cookie("jwt", token, cookieOptions);
    console.log(`🔑 [LOGIN] ✅ Cookie set successfully`);

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
    console.log('🔍 getUserData called for user:', req.user._id);
    const userId = req.user._id;

    const user = await UserModel.findById(userId).select("-hashedPassword");
    console.log('📦 User found in database:', !!user);
    console.log('🎨 User avatarData present:', !!user?.avatarData);
    console.log('🎨 AvatarData type:', typeof user?.avatarData);
    console.log('🎨 AvatarData length:', user?.avatarData?.length);

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
    console.error("Error fetching user contacts:", error);
    return next(error);
  }
};
