import { io } from "socket.io-client";

const URL = "https://smartcollgeapp-production.up.railway.app"; // سيرفرك على Railway

// 🔑 توكن الأدمن الصالح
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDUwNWI2Y2I1NzY4NDM5NDYzNjE5YiIsIm5hbWUiOiJNYWluIFN1cGVyIEFkbWluIiwiZW1haWwiOiJzbWFydGNvbGxnZTgyQGdtYWlsLmNvbSIsInJvbGUiOiJTdXBlckFkbWluIiwicm9sZUlkIjpudWxsLCJ1c2VyVHlwZSI6IkFkbWluIiwiaWF0IjoxNzU4OTY1MTgyLCJleHAiOjE3NTk1Njk5ODJ9.MIy8VlO7ZfCUnLnrh73YjhYmIFu0QY3OwF4jKFF4fn8";
// 🟢 chatId الصحيح من قاعدة البيانات
const CHAT_ID = "68d79c76dbfa08817c321c45";

const adminSocket = io(URL, {
  transports: ["polling"], // أفضل على Railway
  path: "/socket.io",
  auth: { token: TOKEN },
});

// ✅ عند الاتصال
adminSocket.on("connect", () => {
  console.log(`✅ Admin connected: ${adminSocket.id}`);

  // إرسال رسالة واحدة مباشرة عند الاتصال
  adminSocket.emit(
    "send_message",
    { content: "رسالة تجريبية من الأدمن 🎯", chatId: CHAT_ID },
    (ack: any) => console.log("✅ الرسالة تم إيصالها:", ack)
  );

  // إرسال رسائل متكررة كل 10 ثواني للتجربة
  let count = 1;
  setInterval(() => {
    const text = `رسالة ${count} من الأدمن 🎯`;
    adminSocket.emit(
      "send_message",
      { content: text, chatId: CHAT_ID },
      (ack: any) => console.log(`✅ الرسالة ${count} تم إيصالها:`, ack)
    );
    count++;
  }, 10000);
});

// 📩 استقبال أي رسائل واردة
adminSocket.on("message", (msg: any) => {
  console.log("📩 Admin received:", msg.content);
});

// ⚠️ التعامل مع أخطاء الاتصال
adminSocket.on("connect_error", (err: any) => console.error("⚠️ Connect error:", err.message));

// ❌ التعامل مع قطع الاتصال
adminSocket.on("disconnect", (reason: any) => console.log("❌ Disconnected:", reason));
