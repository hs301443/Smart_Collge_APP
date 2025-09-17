"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chats_1 = require("../../controller/users/chats");
const authenticated_1 = require("../../middlewares/authenticated");
const catchAsync_1 = require("../../utils/catchAsync");
const router = express_1.default.Router();
router.post("/rooms", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.createRoom));
router.post("/rooms/:roomId/join", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.joinRoom));
router.post("/rooms/:roomId/messages", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.sendMessage));
router.get("/rooms/:roomId/messages", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.getMessages));
exports.default = router;
