import { io } from "socket.io-client";

const URL = "https://smartcollgeapp-production.up.railway.app";

// 🔑 التوكن الجديد للأدمن
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDUwNWI2Y2I1NzY4NDM5NDYzNjE5YiIsIm5hbWUiOiJNYWluIFN1cGVyIEFkbWluIiwiZW1haWwiOiJzbWFydGNvbGxnZTgyQGdtYWlsLmNvbSIsInJvbGUiOiJTdXBlckFkbWluIiwicm9sZUlkIjpudWxsLCJpYXQiOjE3NTg5NjM4NzgsImV4cCI6MTc1OTU2ODY3OH0.46P6_ijd_8sMr7qpHL8CMPvRsheNS9229YimSpyKNBs";

// 📌 الـ chatId اللي هتبعت فيه الرسالة
const CHAT_ID = "68d79c76dbfa08817c321c45";

const adminSocket = io(URL, {
  transports: ["polling"], // لو websocket يعطيك مشكلة على Railway
  path: "/socket.io",
  auth: { token: TOKEN },
});

adminSocket.on("connect", () => {
  console.log(`✅ Admin connected: ${adminSocket.id}`);

  // ابعت رسالة واحدة للتست
  adminSocket.emit(
    "send_message",
    {
      content: "رسالة تجريبية من الأدمن 🎯",
      chatId: CHAT_ID,
    },
    (ack: any) => {
      console.log("✅ Admin confirmed message delivered:", ack);
    }
  );
});

// استقبال أي رسالة جديدة
adminSocket.on("message", (msg: any) => {
  console.log("📩 Admin received:", msg.content);
});

// أخطاء الاتصال
adminSocket.on("connect_error", (err: any) => {
  console.error("⚠️ Admin connect error:", err.message);
});

adminSocket.on("disconnect", (reason: any) => {
  console.log("❌ Admin disconnected. Reason:", reason);
});
