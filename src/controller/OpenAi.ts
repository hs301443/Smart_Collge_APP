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
                "أنت مساعد ذكي. دايمًا رد بنفس لغة المستخدم. لو كتب بالعربية رد بالعربية، لو كتب بالإنجليزية رد بالإنجليزية. خلي إجابتك طبيعية ومختصرة.",
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
}
  
export default new OpenRouterService();