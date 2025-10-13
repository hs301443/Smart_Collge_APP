import express from "express";
import http from "http";
import { Server } from "socket.io";
import ApiRoute from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { NotFound } from "./Errors";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { connectDB } from "./models/connection";
import { initChatSocket } from "./utils/chatSocket";
import path from "path";

dotenv.config();

const app = express();
connectDB();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: "*" }));
app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ✅ نخلي السيرفر يشوف الصور من dist/uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

const server = http.createServer(app);

// ✅ Socket.IO مع CORS + Polling فقط
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Route للتجربة
app.get("/", (req, res) => {
  res.send("✅ API & Socket.IO Server is running on Railway...");
});

// Routes
app.use("/api", ApiRoute);
initChatSocket(io);

// Not found handler
app.use((req, res, next) => {
  throw new NotFound("Route not found");
});
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
