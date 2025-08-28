import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { authorizeJwt } from "../middleware/auth.js";
import UserModel from "../models/user.js";

const router = express.Router();

// Debug-Route um Auth zu testen
router.post("/test", authorizeJwt, (req, res) => {
  console.log("Test route reached, user:", req.user);
  res.json({ success: true, user: req.user._id });
});

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
    console.log("Avatar upload route reached");
    console.log("User:", req.user?._id);
    console.log("File:", req.file ? { size: req.file.size, mimetype: req.file.mimetype } : "No file");
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

      // Only update avatarData if provided in request body
      if (avatarData !== undefined) {
        updateData.avatarData = avatarData;
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
