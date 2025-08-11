import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (username, id) => {
  return jwt.sign({ username: username, id: id }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
};
