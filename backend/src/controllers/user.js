import checkIsMatchable from "../../utils/profileValidator.js";
import { generateToken } from "../libs/jwt.js";
import { hashPassword, comparePassword } from "../libs/pw.js";
import UserModel from "../models/user.js";

export const createUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const hashedPassword = await hashPassword(password);

    let newAccount = new UserModel({
      email,
      hashedPassword,
      username,
      isMatchable: false,
    });

    await newAccount.save();

    const token = generateToken(username, newAccount._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newAccount._id,
        username: newAccount.username,
        email: newAccount.email,
        isMatchable: false,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
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
    } = req.body;

    const updateData = {};

    if (aboutMe !== undefined) updateData.aboutMe = aboutMe;
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

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-hashedPassword");
    still;

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

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
      isMatchable: updatedUser.isMatchable,
    });
  } catch (error) {
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

    const isNowMatchable = checkIsMatchable(user);
    if (isNowMatchable !== user.isMatchable) {
      user.isMatchable = isNowMatchable;
      await user.save();
    }

    const token = generateToken(existingUser.username, existingUser._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isMatchable: user.isMatchable,
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
