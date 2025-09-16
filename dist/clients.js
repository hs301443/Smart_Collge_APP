"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const URL = "https://smartcollgeapp-production.up.railway.app";
const socket = (0, socket_io_client_1.io)(URL, {
    transports: ["websocket"], // مهم عشان Railway ساعات بتلغبط في الـ polling
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
            text: "Hello Admin from TS Client!",
        });
        console.log("📤 Message sent");
    }, 2000);
});
// استقبل الرسائل
socket.on("receiveMessage", (msg) => {
    console.log("📩 Received:", msg);
});
socket.on("disconnect", () => {
    console.log("❌ Disconnected");
});
socket.on("connect_error", (err) => {
    console.error("⚠️ Connect error:", err.message);
});
