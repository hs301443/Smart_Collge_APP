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
import { setupSocket } from "./utils/chatSocket"; // socket utils

dotenv.config();

const app = express();
connectDB();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: "*" }));
app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use("/uploads", express.static("uploads"));

// Route للتجربة
app.get("/", (req, res) => {
  res.send("✅ API & Socket.IO Server is running on Railway...");
});

// Routes
app.use("/api", ApiRoute);

// Not found handler
app.use((req, res, next) => {
  throw new NotFound("Route not found");
});
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 3000;

// Create server
const server = http.createServer(app);

// ✅ Socket.IO مع CORS + Polling فقط
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["polling", "websocket"], 
  pingInterval: 10000,
  pingTimeout: 20000,

});

// اربط Socket.IO
setupSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
