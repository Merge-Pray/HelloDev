import express from "express";
import cors from "cors";
import "dotenv/config";
import { errorHandler } from "./middleware/error-handler.js";
import db from "./db/db.js";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.js";

const PORT = process.env.PORT || 3001;

const app = express();

db.connect();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use("/api/user", userRouter);
app.get("/", (req, res) => {
  res.send("hello");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🫡 Server is running at: http://localhost:${PORT}`);
});
