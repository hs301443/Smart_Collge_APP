"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const Errors_1 = require("./Errors");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const connection_1 = require("./models/connection");
const chatSocket_1 = require("./utils/chatSocket"); // socket utils
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, connection_1.connectDB)();
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, cors_1.default)({ origin: "*" }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "20mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "20mb" }));
app.use("/uploads", express_1.default.static("uploads"));
// ✅ Route بسيط للتجربة
app.get("/", (req, res) => {
    res.send("✅ API & Socket.IO Server is running on Railway...");
});
// Routes
app.use("/api", routes_1.default);
// Not found handler
app.use((req, res, next) => {
    throw new Errors_1.NotFound("Route not found");
});
app.use(errorHandler_1.errorHandler);
// ✅ استخدم بورت Railway
const PORT = process.env.PORT || 3000;
const server = http_1.default.createServer(app);
// ✅ Socket.IO مع إعدادات CORS
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // ممكن تحط لينك الفرونت إند هنا لو عايز تقفلها
        methods: ["GET", "POST"],
    },
});
// اربط Socket.IO
(0, chatSocket_1.setupSocket)(io);
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
