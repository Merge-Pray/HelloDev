import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { authorizeJwt } from "../middleware/auth.js";

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
  "/image",
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
      const folder = `polls/${userId}`;

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: folder,
              resource_type: "image",
              allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
              transformation: [
                { width: 1000, height: 1000, crop: "limit" },
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

      res.status(200).json({
        message: "Image uploaded successfully",
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      console.error("Image upload error:", error);

      if (error.message === "File too large") {
        error.statusCode = 400;
        error.message = "Image file too large. Maximum size is 5MB.";
      } else if (error.message === "Only image files are allowed") {
        error.statusCode = 400;
      } else {
        error.statusCode = 500;
        error.message = "Failed to upload image";
      }

      next(error);
    }
  }
);

// Multiple images upload endpoint
router.post(
  "/images",
  authorizeJwt,
  upload.array("images", 10),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        const error = new Error("No image files provided");
        error.statusCode = 400;
        return next(error);
      }

      const userId = req.user._id;
      const folder = `polls/${userId}`;

      // Upload all images in parallel
      const uploadPromises = req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: folder,
                  resource_type: "image",
                  allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
                  transformation: [
                    { width: 1000, height: 1000, crop: "limit" },
                    { quality: "auto" },
                    { fetch_format: "auto" },
                  ],
                },
                (error, result) => {
                  if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                  } else {
                    resolve({
                      url: result.secure_url,
                      public_id: result.public_id,
                    });
                  }
                }
              )
              .end(file.buffer);
          })
      );

      const results = await Promise.all(uploadPromises);

      res.status(200).json({
        message: "Images uploaded successfully",
        images: results,
      });
    } catch (error) {
      console.error("Images upload error:", error);
      error.statusCode = 500;
      error.message = "Failed to upload images";
      next(error);
    }
  }
);

export default router;
