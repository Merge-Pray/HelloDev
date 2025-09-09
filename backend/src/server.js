import express from "express";
import cors from "cors";
import "dotenv/config";
import { errorHandler } from "./middleware/error-handler.js";
import db from "./db/db.js";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.js";
import { postsRouter } from "./routes/posts.js";
import { suggestionRouter } from "./routes/suggestions.js";
import { matchRouter } from "./routes/match.js";
import { uploadRouter } from "./routes/upload.js";
import { chatRouter } from "./routes/chat.js";
import { searchRouter } from "./routes/search.js";
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./services/socketHandler.js";
import { socketAuth } from "./services/socketAuth.js";
import { contactRequestRouter } from "./routes/contactrequest.js";

const PORT = process.env.PORT || 3001;

const app = express();

db.connect();

app.use(express.json());

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://hellodev.social",
  "https://www.hellodev.social",
  "https://hellodev.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200,
  })
);

app.use("/api/user", userRouter);
app.use("/api/posts", postsRouter);
app.use("/api/suggestions", suggestionRouter);
app.use("/api/match", matchRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/chats", chatRouter);
app.use("/api/search", searchRouter);
app.use("/api/contactrequest", contactRequestRouter);
app.get("/", (req, res) => {
  res.send("hello");
});

app.use(errorHandler);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("socketio", io);

io.use(socketAuth);

socketHandler(io);

httpServer.listen(PORT, () => {
  console.log(`🫡 Server is running at: http://localhost:${PORT}`);
});
