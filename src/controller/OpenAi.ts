import axios from "axios";
import { ChatResponse, ImageResponse, ModerationResponse } from "../types/openai";

class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }

    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseUrl = "https://openrouter.ai/api/v1";
    this.defaultModel = "mistralai/mistral-7b-instruct";
  }

  async generateChat(prompt: string) {
  try {
    const response = await axios.post<ChatResponse>(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.defaultModel,
        messages: [
          {
            role: "system",
            content:
              "انت مساعد دردشة ودود. حدد لغة المستخدم الأساسية من أول جملة (سواء كانت العربية أو الإنجليزية) ورد بها فقط. تجاهل أي لغة أخرى حتى لو كانت مكتوبة مع الرسالة.",
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://smartcollgeapp-production.up.railway.app",
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data.choices[0].message.content,
      usage: response.data.usage,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

  async generateImage(prompt: string) {
    try {
      const response = await axios.post<ImageResponse>(
        `${this.baseUrl}/images`,
        { prompt, size: "512x512" },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://smartcollgeapp-production.up.railway.app",
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data.data[0].url,
      };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  async moderateContent(text: string) {
    try {
      const response = await axios.post<ModerationResponse>(
        `${this.baseUrl}/moderations`,
        { input: text },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://smartcollgeapp-production.up.railway.app",
            "Content-Type": "application/json",
          },
        }
      );

      return { success: true, data: response.data.results[0] };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
}

export default new OpenRouterService();
