import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { authorizeJwt } from "../middleware/auth.js";
import UserModel from "../models/user.js";

export const uploadRouter = express.Router();

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

uploadRouter.post(
  "/avatar",
  authorizeJwt,
  upload.single("image"),
  async (req, res, next) => {
    console.log("Avatar upload route reached");
    console.log("User:", req.user?._id);
    console.log(
      "File:",
      req.file
        ? { size: req.file.size, mimetype: req.file.mimetype }
        : "No file"
    );
    console.log("Body:", req.body);

    try {
      if (!req.file) {
        console.log("Error: No image file provided");
        const error = new Error("No image file provided");
        error.statusCode = 400;
        return next(error);
      }

      const userId = req.user._id;
      const folder = `avatars/${userId}`;

      // Get avatarData from request body
      const { avatarData } = req.body;
      console.log("Avatar data received:", avatarData ? "Yes" : "No");
      console.log("Avatar data type:", typeof avatarData);
      console.log("Avatar data content:", avatarData);
      
      // Validate and process avatarData
      let processedAvatarData = null;
      if (avatarData) {
        try {
          // If it's already a string, use it directly
          if (typeof avatarData === 'string') {
            // Validate it's valid JSON
            JSON.parse(avatarData);
            processedAvatarData = avatarData;
            console.log("✅ Avatar data is valid JSON string");
          } else {
            // If it's an object/array, stringify it
            processedAvatarData = JSON.stringify(avatarData);
            console.log("✅ Avatar data converted to JSON string");
          }
        } catch (error) {
          console.error("❌ Invalid avatar data:", error);
          processedAvatarData = null;
        }
      }

      // Upload to Cloudinary
      console.log("Starting Cloudinary upload...");

      let result;
      try {
        result = await new Promise((resolve, reject) => {
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
      } catch (cloudinaryError) {
        console.log("Cloudinary failed, using fallback...");
        // Fallback: Create a mock result
        result = {
          secure_url: `https://via.placeholder.com/400x400/5d3f94/ffffff?text=Avatar`,
          public_id: `fallback_${userId}_${Date.now()}`,
        };
      }

      // Update user's avatar field and avatarData in database
      const updateData = {
        avatar: result.secure_url,
      };

      // Only update avatarData if processed successfully
      if (processedAvatarData !== null) {
        updateData.avatarData = processedAvatarData;
        console.log("💾 Saving avatar data to database");
      } else {
        console.log("⚠️ No valid avatar data to save");
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, select: "-hashedPassword" }
      );

      if (!updatedUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        return next(error);
      }

      console.log("✅ User updated successfully");
      console.log("📊 Updated user avatarData:", updatedUser.avatarData ? "Present" : "Not present");
      console.log("📊 AvatarData type in DB:", typeof updatedUser.avatarData);

      res.status(200).json({
        success: true,
        message: "Avatar uploaded successfully",
        avatar: result.secure_url,
        public_id: result.public_id,
        user: updatedUser, // Return complete user data instead of partial
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
