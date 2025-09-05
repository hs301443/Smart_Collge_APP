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
    this.defaultModel = "mistralai/mistral-small-3.1-24b-instruct"; // موديل داعم للعربية
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
                "أنت مساعد ذكي. تحدد لغة المستخدم من أول رسالة (العربية أو الإنجليزية) وترد بها فقط، بإجابة طبيعية وواضحة بدون زيادة كلام.",
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

    const data = (response.data as any)?.data;
    if (!data || data.length === 0) {
      return { success: false, error: "No image data returned from API" };
    }

    return {
      success: true,
      data: data[0]?.url || "",
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

    const results = (response.data as any)?.results;
    if (!results || results.length === 0) {
      return { success: false, error: "No moderation results returned from API" };
    }

    return { success: true, data: results[0] };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

}

export default new OpenRouterService();
