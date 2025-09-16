import { io } from "socket.io-client";

const URL = "https://smartcollgeapp-production.up.railway.app"; // رابط السيرفر

const socket = io(URL, {
  path: "/socket.io",       // Path مطابق للسيرفر
  transports: ["polling"],  // Polling فقط
  reconnectionAttempts: 10, // إعادة محاولة الاتصال
  timeout: 20000,
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // سجل يوزر
  socket.emit("register", { userId: "123", role: "User" });

  // ابعت رسالة بعد 2 ثانية
  setTimeout(() => {
    socket.emit("sendMessage", {
      from: "123",
      fromModel: "User",
      to: "456",
      toModel: "Admin",
      text: "Hello Admin from Polling Client!",
    });
    console.log("📤 Message sent");
  }, 2000);
});

// استقبل الرسائل
socket.on("receiveMessage", (msg) => {
  console.log("📩 Received:", msg);
});

// Disconnect مع سبب
socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected. Reason:", reason);
});

// أخطاء الاتصال
socket.on("connect_error", (err) => {
  console.error("⚠️ Connect error:", err.message);
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(`🔄 Reconnection attempt: ${attempt}`);
});

socket.on("reconnect_failed", () => {
  console.error("❌ Reconnection failed");
});
