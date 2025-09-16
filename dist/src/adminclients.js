"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const URL = "https://smartcollgeapp-production.up.railway.app";
const socket = (0, socket_io_client_1.io)(URL, {
    transports: ["polling"], // مهم على Railway
    timeout: 20000,
});
socket.on("connect", () => {
    console.log("✅ Admin connected:", socket.id);
    // سجل نفسك كـ Admin
    socket.emit("register", { userId: "admin1", role: "Admin" });
    // ابعت رسالة بعد ثانيتين للـ user
    setTimeout(() => {
        socket.emit("sendMessage", {
            from: "admin1",
            fromModel: "Admin",
            to: "123",
            toModel: "User",
            text: "Hello User! This is Admin.",
        });
        console.log("📤 Admin message sent");
    }, 2000);
});
// استقبل أي رسائل
socket.on("receiveMessage", (msg) => {
    console.log("📩 Admin received:", msg);
});
socket.on("disconnect", (reason) => {
    console.log("❌ Admin disconnected. Reason:", reason);
});
socket.on("connect_error", (err) => {
    console.error("⚠️ Admin connect error:", err.message);
});
