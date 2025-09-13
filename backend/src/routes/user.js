import express from "express";
import {
  authorizeJwt,
  refreshToken,
  checkAuthStatus,
} from "../middleware/auth.js";
import {
  createUser,
  verifyLogin,
  logout,
  getUserData,
  getUserProfile,
  updateUserProfile,
  getUserContacts,
  googleAuth,
  githubAuth,
  deleteUserAccount,
} from "../controllers/user.js";
import { registerValidationRules, validate } from "../middleware/validation.js";

export const userRouter = express.Router();

userRouter
  .post("/register", registerValidationRules(), validate, createUser)
  .post("/login", verifyLogin)
  .post("/google-auth", googleAuth)
  .post("/github-auth", githubAuth)
  .post("/logout", logout)
  .post("/refresh", refreshToken)
  .get("/auth-status", checkAuthStatus)
  .get("/test-cookie", (req, res) => {
    // Set a simple test cookie
    res.cookie("test-cookie", "hello-samsung", {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      maxAge: 60000, // 1 minute
    });
    res.json({ message: "Test cookie set", timestamp: Date.now() });
  })
  .get("/debug-cookies", (req, res) => {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const isProblematicBrowser = /SamsungBrowser|CriOS/i.test(userAgent);
    console.log(`🐛 [DEBUG] Cookie debug for browser: ${isProblematicBrowser ? '⚠️ ' : ''}${userAgent.includes('SamsungBrowser') ? 'Samsung' : userAgent.includes('CriOS') ? 'iOS Chrome' : 'Other'}`);
    console.log(`🐛 [DEBUG] All cookies:`, req.cookies);
    console.log(`🐛 [DEBUG] Raw cookie header:`, req.headers.cookie);
    console.log(`🐛 [DEBUG] JWT cookie specifically:`, req.cookies.jwt);
    res.json({
      userAgent,
      isProblematicBrowser,
      cookies: req.cookies,
      rawCookieHeader: req.headers.cookie,
      jwtCookie: req.cookies.jwt,
      hasJwtCookie: !!req.cookies.jwt
    });
  })
  .get("/user", authorizeJwt, getUserData)
  .get("/contacts", authorizeJwt, getUserContacts)
  .get("/profile/:userId", authorizeJwt, getUserProfile)
  .patch("/update", authorizeJwt, updateUserProfile)
  .delete("/delete", authorizeJwt, deleteUserAccount);
