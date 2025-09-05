"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class OpenRouterService {
    constructor() {
        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error("OPENROUTER_API_KEY is not set in environment variables");
        }
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseUrl = "https://openrouter.ai/api/v1";
        this.defaultModel = "mistralai/mistral-small-3.1-24b-instruct"; // موديل داعم للعربية
    }
    async generateChat(prompt) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: this.defaultModel,
                messages: [
                    {
                        role: "system",
                        content: "أنت مساعد ذكي. تحدد لغة المستخدم من أول رسالة (العربية أو الإنجليزية) وترد بها فقط، بإجابة طبيعية وواضحة بدون زيادة كلام.",
                    },
                    { role: "user", content: prompt },
                ],
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "HTTP-Referer": "https://smartcollgeapp-production.up.railway.app",
                    "Content-Type": "application/json",
                },
            });
            return {
                success: true,
                data: response.data.choices[0].message.content,
                usage: response.data.usage,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message,
            };
        }
    }
    async generateImage(prompt) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/images`, { prompt, size: "512x512" }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "HTTP-Referer": "https://smartcollgeapp-production.up.railway.app",
                    "Content-Type": "application/json",
                },
            });
            const data = response.data?.data;
            if (!data || data.length === 0) {
                return { success: false, error: "No image data returned from API" };
            }
            return {
                success: true,
                data: data[0]?.url || "",
            };
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || error.message };
        }
    }
    async moderateContent(text) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/moderations`, { input: text }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "HTTP-Referer": "https://smartcollgeapp-production.up.railway.app",
                    "Content-Type": "application/json",
                },
            });
            const results = response.data?.results;
            if (!results || results.length === 0) {
                return { success: false, error: "No moderation results returned from API" };
            }
            return { success: true, data: results[0] };
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || error.message };
        }
    }
}
exports.default = new OpenRouterService();
