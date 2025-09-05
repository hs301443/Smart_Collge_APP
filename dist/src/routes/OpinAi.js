"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OpenAi_1 = __importDefault(require("../controller/OpenAi"));
const router = (0, express_1.Router)();
router.post("/chat", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
    }
    const result = await OpenAi_1.default.generateChat(prompt);
    return res.json(result);
});
router.post("/image", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
    }
    const result = await OpenAi_1.default.generateImage(prompt);
    return res.json(result);
});
router.post("/moderation", async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ success: false, error: "Text is required" });
    }
    const result = await OpenAi_1.default.moderateContent(text);
    return res.json(result);
});
exports.default = router;
