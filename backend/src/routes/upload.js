import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { authorizeJwt } from "../middleware/auth.js";
import UserModel from "../models/user.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.post(
  "/avatar",
  authorizeJwt,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        const error = new Error("No image file provided");
        error.statusCode = 400;
        return next(error);
      }

      const userId = req.user._id;
      const folder = `avatars/${userId}`;

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: folder,
              resource_type: "image",
              allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
              transformation: [
                { width: 400, height: 400, crop: "fill", gravity: "face" }, // Square avatar, face-focused
                { quality: "auto" },
                { fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(req.file.buffer);
      });

      // Update user's avatar field in database
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          avatar: result.secure_url,
          avatarData: null, // Clear any existing pixel art data when uploading new image
        },
        { new: true, select: "-hashedPassword" }
      );

      if (!updatedUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        return next(error);
      }

      res.status(200).json({
        success: true,
        message: "Avatar uploaded successfully",
        avatar: result.secure_url,
        public_id: result.public_id,
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          nickname: updatedUser.nickname,
          avatar: updatedUser.avatar,
          avatarData: updatedUser.avatarData,
        },
      });
    } catch (error) {
      console.error("Avatar upload error:", error);

      if (error.message === "File too large") {
        error.statusCode = 400;
        error.message = "Image file too large. Maximum size is 5MB.";
      } else if (error.message === "Only image files are allowed") {
        error.statusCode = 400;
      } else {
        error.statusCode = 500;
        error.message = "Failed to upload avatar";
      }

      next(error);
    }
  }
);

export default router;
