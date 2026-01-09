import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import postsRoutes from "./routes/posts";
import usersRoutes from "./routes/users"

config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/users", usersRoutes)

const port = process.env["PORT"] || 5001;

const server = app.listen(port, () => {});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);

  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.error("SIGTERM recieved, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
