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


export default router;