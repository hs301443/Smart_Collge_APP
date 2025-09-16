import { io } from "socket.io-client";

const URL = "https://smartcollgeapp-production.up.railway.app"; // سيرفر Railway

const socket = io(URL, {
  transports: ["polling"], // لازم Polling على Railway
  timeout: 20000,
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // سجل نفسك
  socket.emit("register", { userId: "testUser", role: "User" });

  // ابعت رسالة تجريبية بعد ثانيتين
  setTimeout(() => {
    socket.emit("sendMessage", {
      from: "testUser",
      fromModel: "User",
      to: "admin1",
      toModel: "Admin",
      text: "Hello Admin! This is a realtime test",
    });
    console.log("📤 Message sent");
  }, 2000);
});

// استقبل أي رسائل
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
