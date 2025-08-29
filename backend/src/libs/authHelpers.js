import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

export const extractTokenFromCookies = (cookieString) => {
  if (!cookieString) return null;
  
  const cookieArray = cookieString.split(';');
  for (let cookie of cookieArray) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'jwt') {
      return value;
    }
  }
  return null;
};

export const isTokenExpiringSoon = (token) => {
  try {
    const decoded = jwt.decode(token);
    const now = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - now;
    return timeUntilExpiry < 300;
  } catch {
    return true;
  }
};

export const verifyTokenAndGetUser = async (token) => {
  if (!token) {
    throw new Error("No token provided");
  }

  const isVerified = jwt.verify(token, process.env.JWT_SECRET);
  const user = await UserModel.findById(isVerified.id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};