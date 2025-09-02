import {
  extractTokenFromCookies,
  verifyTokenAndGetUser,
} from "../libs/authHelpers.js";

export const socketAuth = async (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    const token = extractTokenFromCookies(cookies);
    
    if (token) {
      const user = await verifyTokenAndGetUser(token);
      socket.user = user;
      socket.authenticated = true;
    } else {
      console.log("Socket connection without token - allowing but marking as unauthenticated");
      socket.authenticated = false;
    }
    
    next(); // Always allow connection, just mark auth status
  } catch (error) {
    console.error("Socket Authentication Error:", error.message);
    socket.authenticated = false;
    next(); // Allow connection but without auth
  }
};
