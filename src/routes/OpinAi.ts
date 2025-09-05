import { Router } from "express";
import OpenRouterService from "../controller/OpenAi";

const router = Router();

router.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: "Prompt is required" });
  }

  const result = await OpenRouterService.generateChat(prompt);
  return res.json(result);
});


router.post("/image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: "Prompt is required" });
  }

  const result = await OpenRouterService.generateImage(prompt);
  return res.json(result);
});

router.post("/moderation", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, error: "Text is required" });
  }

  const result = await OpenRouterService.moderateContent(text);
  return res.json(result);
});

export default router;