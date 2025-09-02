import checkIsMatchable from "../../utils/profileValidator.js";
import { generateToken } from "../libs/jwt.js";
import { hashPassword, comparePassword } from "../libs/pw.js";
import { verifyGoogleToken } from "../libs/googleAuth.js";
import UserModel from "../models/user.js";
import { getSamsungCompatibleCookieOptions } from "../utils/browserDetection.js";


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
      authProvider: "local",
    });

    await newAccount.save();

    const token = generateToken(username, newAccount._id);

    const cookieOptions = getSamsungCompatibleCookieOptions(req.get('User-Agent'), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    res.cookie("jwt", token, cookieOptions);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newAccount._id,
        username: newAccount.username,
        nickname: newAccount.nickname,
        email: newAccount.email,
        isMatchable: false,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    console.log('Google Auth endpoint called');
    const { credential } = req.body;
    console.log('Credential received:', credential ? 'Present' : 'Missing');

    if (!credential) {
      console.log('No credential provided');
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    console.log('Verifying Google token...');
    const verificationResult = await verifyGoogleToken(credential);
    console.log('Verification result:', verificationResult);

    if (!verificationResult.success) {
      console.log('Token verification failed:', verificationResult.error);
      return res.status(401).json({
        success: false,
        message: "Invalid Google token",
        error: verificationResult.error,
      });
    }

    const { googleId, email, name, picture } = verificationResult.data;
    console.log('Google user data:', { googleId, email, name, picture: picture ? 'Present' : 'Missing' });

    // Check if user already exists with this Google ID
    let existingUser = await UserModel.findOne({ googleId });

    if (existingUser) {
      console.log('Existing Google user found, logging in');
      // User exists, log them in
      const isNowMatchable = checkIsMatchable(existingUser);
      if (isNowMatchable !== existingUser.isMatchable) {
        existingUser.isMatchable = isNowMatchable;
        await existingUser.save();
      }

      const token = generateToken(existingUser.username, existingUser._id);

      const cookieOptions = getSamsungCompatibleCookieOptions(req.get('User-Agent'), {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      
      res.cookie("jwt", token, cookieOptions);

      return res.status(200).json({
        message: "Google login successful",
        isNewUser: false,
        user: {
          _id: existingUser._id,
          username: existingUser.username,
          nickname: existingUser.nickname,
          email: existingUser.email,
          isMatchable: existingUser.isMatchable,
          avatar: existingUser.avatar || picture,
          authProvider: existingUser.authProvider,
        },
      });
    }

    // Check if user exists with this email but different auth provider
    const existingEmailUser = await UserModel.findOne({ email });
    if (existingEmailUser && existingEmailUser.authProvider === "local") {
      console.log('Email already exists with local auth');
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please sign in with your password.",
      });
    }

    // Create new user
    console.log('Creating new Google user');
    
    // Für Google-Accounts verwenden wir die komplette E-Mail-Adresse als Username
    // Der Username kann später im Profil geändert werden
    const username = email;
    
    // Prüfe, ob der Username bereits existiert (sollte bei E-Mail-Adressen nicht passieren)
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      console.log('Username (email) already exists - this should not happen');
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }
    
    const nickname = name || email.split('@')[0];

    const newUser = new UserModel({
      email,
      username,
      nickname,
      googleId,
      authProvider: "google",
      avatar: picture,
      isMatchable: false,
    });

    await newUser.save();
    console.log('New Google user created:', newUser._id);

    const token = generateToken(newUser.username, newUser._id);

    const cookieOptions = getSamsungCompatibleCookieOptions(req.get('User-Agent'), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    res.cookie("jwt", token, cookieOptions);

    return res.status(201).json({
      message: "Google account created successfully",
      isNewUser: true,
      user: {
        _id: newUser._id,
        username: newUser.username,
        nickname: newUser.nickname,
        email: newUser.email,
        isMatchable: false,
        avatar: newUser.avatar,
        authProvider: newUser.authProvider,
      },
    });

  } catch (error) {
    console.error("Google Auth error:", error);
    return next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    console.log('updateUserProfile called for user:', req.user._id);
    console.log('updateUserProfile request body keys:', Object.keys(req.body));
    
    const userId = req.user._id;
    const {
      username,
      nickname,
      email,
      avatar,
      avatarData,
      aboutMe,
      country,
      city,
      age,
      status,
      devExperience,
      techArea,
      favoriteTimeToCode,
      favoriteLineOfCode,
      programmingLanguages,
      techStack,
      preferredOS,
      languages,
      gaming,
      otherInterests,
      favoriteDrinkWhileCoding,
      musicGenreWhileCoding,
      favoriteShowMovie,
      linkedinProfile,
      githubProfile,
      personalWebsites,
      profileLinksVisibleToContacts,
      password,
      currentPassword,
    } = req.body;

    const updateData = {};

    if (username !== undefined) {
      const existingUsername = await UserModel.findOne({
        username: username,
        _id: { $ne: userId },
      });

      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }

      updateData.username = username;
    }

    if (email !== undefined) {
      // Überprüfe den aktuellen Benutzer um festzustellen, ob es ein Google-Benutzer ist
      const currentUser = await UserModel.findById(userId);
      
      if (currentUser && currentUser.authProvider === "google") {
        return res.status(400).json({
          success: false,
          message: "Google users cannot change their email address here. Please use your Google account settings.",
        });
      }

      const existingEmail = await UserModel.findOne({
        email: email,
        _id: { $ne: userId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      updateData.email = email;
    }

    if (password !== undefined) {
      const currentUser = await UserModel.findById(userId);

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Google users können ihr Passwort nicht über diese Route ändern
      if (currentUser.authProvider === "google") {
        return res.status(400).json({
          success: false,
          message: "Google users cannot change password here. Please use Google account settings.",
        });
      }

      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to update password",
        });
      }

      const passwordMatch = await comparePassword(
        currentPassword,
        currentUser.hashedPassword
      );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters long",
        });
      }

      const hashedPassword = await hashPassword(password);
      updateData.hashedPassword = hashedPassword;
    }

    if (aboutMe !== undefined) updateData.aboutMe = aboutMe;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (avatarData !== undefined) updateData.avatarData = avatarData;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (age !== undefined) updateData.age = age;
    if (status !== undefined) updateData.status = status;
    if (devExperience !== undefined) updateData.devExperience = devExperience;
    if (techArea !== undefined) updateData.techArea = techArea;
    if (favoriteTimeToCode !== undefined)
      updateData.favoriteTimeToCode = favoriteTimeToCode;
    if (favoriteLineOfCode !== undefined)
      updateData.favoriteLineOfCode = favoriteLineOfCode;
    if (programmingLanguages !== undefined)
      updateData.programmingLanguages = programmingLanguages;
    if (techStack !== undefined) updateData.techStack = techStack;
    if (preferredOS !== undefined) updateData.preferredOS = preferredOS;
    if (languages !== undefined) updateData.languages = languages;
    if (gaming !== undefined) updateData.gaming = gaming;
    if (otherInterests !== undefined)
      updateData.otherInterests = otherInterests;
    if (favoriteDrinkWhileCoding !== undefined)
      updateData.favoriteDrinkWhileCoding = favoriteDrinkWhileCoding;
    if (musicGenreWhileCoding !== undefined)
      updateData.musicGenreWhileCoding = musicGenreWhileCoding;
    if (favoriteShowMovie !== undefined)
      updateData.favoriteShowMovie = favoriteShowMovie;
    if (linkedinProfile !== undefined)
      updateData.linkedinProfile = linkedinProfile;
    if (githubProfile !== undefined) updateData.githubProfile = githubProfile;
    if (personalWebsites !== undefined)
      updateData.personalWebsites = personalWebsites;
    if (profileLinksVisibleToContacts !== undefined)
      updateData.profileLinksVisibleToContacts = profileLinksVisibleToContacts;

    console.log('updateData to be applied:', updateData);

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-hashedPassword");

    console.log('User updated successfully:', updatedUser ? 'Yes' : 'No');

    if (!updatedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const isNowMatchable = checkIsMatchable(updatedUser);

    if (isNowMatchable !== updatedUser.isMatchable) {
      updatedUser.isMatchable = isNowMatchable;
      await updatedUser.save();
    }

    let newToken = null;
    if (password !== undefined) {
      newToken = generateToken(updatedUser.username, updatedUser._id);

      const cookieOptions = getSamsungCompatibleCookieOptions(req.get('User-Agent'), {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      
      res.cookie("jwt", newToken, cookieOptions);
    }

    console.log('Sending successful response');
    return res.status(200).json({
      success: true,
      message: password
        ? "Profile and password updated successfully"
        : "Profile updated successfully",
      user: updatedUser,
      isMatchable: updatedUser.isMatchable,
      passwordUpdated: password !== undefined,
    });
  } catch (error) {
    console.error('updateUserProfile error:', error);
    console.error('Error stack:', error.stack);
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

    const cookieOptions = getSamsungCompatibleCookieOptions(req.get('User-Agent'), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    res.cookie("jwt", token, cookieOptions);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: existingUser._id,
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
        programmingLanguages: existingUser.programmingLanguages,
        techStack: existingUser.techStack,
        preferredOS: existingUser.preferredOS,
        languages: existingUser.languages,
        gaming: existingUser.gaming,
        otherInterests: existingUser.otherInterests,
        favoriteDrinkWhileCoding: existingUser.favoriteDrinkWhileCoding,
        musicGenreWhileCoding: existingUser.musicGenreWhileCoding,
        favoriteShowMovie: existingUser.favoriteShowMovie,
        isOnline: existingUser.isOnline,
        lastSeen: existingUser.lastSeen,
        points: existingUser.points,
        rating: existingUser.rating,
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
        options: { sort: { lastSeen: -1 } },
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
