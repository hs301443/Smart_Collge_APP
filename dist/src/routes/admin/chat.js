"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_1 = require("../../controller/admin/chat");
const catchAsync_1 = require("../../utils/catchAsync");
const router = express_1.default.Router();
// Admin-only routes
router.post("/", (0, catchAsync_1.catchAsync)(chat_1.createRoomByAdmin));
router.get("/", (0, catchAsync_1.catchAsync)(chat_1.getAllRooms));
router.delete("/:roomId", (0, catchAsync_1.catchAsync)(chat_1.deleteRoom));
exports.default = router;
