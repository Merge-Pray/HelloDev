import { extractTokenFromCookies, verifyTokenAndGetUser } from "../libs/authHelpers.js";

export const socketAuth = async (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    const token = extractTokenFromCookies(cookies);
    const user = await verifyTokenAndGetUser(token);
    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket Authentication Error:", error.message);
    next(new Error("Authentication failed."));
  }
};
