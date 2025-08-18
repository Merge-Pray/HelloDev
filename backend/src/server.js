import express from "express";
import cors from "cors";
import "dotenv/config";
import { errorHandler } from "./middleware/error-handler.js";
import db from "./db/db.js";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.js";
import { postsRouter } from "./routes/posts.js";

const PORT = process.env.PORT || 3001;

const app = express();

db.connect();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://hellodev.social",
      "https://www.hellodev.social",
      "https://hellodev.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 200,
  })
);
app.options("*", cors());

app.use("/api/user", userRouter);
app.use("/api/posts", postsRouter);
app.get("/", (req, res) => {
  res.send("hello");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🫡 Server is running at: http://localhost:${PORT}`);
});
