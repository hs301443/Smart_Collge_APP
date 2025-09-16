import { io } from "socket.io-client";

const URL = "https://smartcollgeapp-production.up.railway.app";

// اختار إما User أو Admin لتجربتهم
const ROLE: "User" | "Admin" = "User"; // غيرها لـ "Admin" لو عايز تجرب الـ admin
const USER_ID = ROLE === "User" ? "123" : "admin1";
const TARGET_ID = ROLE === "User" ? "admin1" : "123";

const socket = io(URL, {
  transports: ["polling"], // لازم Polling على Railway
  timeout: 20000,
});

socket.on("connect", () => {
  console.log(`✅ ${ROLE} connected:`, socket.id);

  // سجل نفسك
  socket.emit("register", { userId: USER_ID, role: ROLE });

  // ابعت رسالة كل 10 ثواني
  let count = 1;
  setInterval(() => {
    const text = `Hello from ${ROLE}! Message ${count}`;
    socket.emit("sendMessage", {
      from: USER_ID,
      fromModel: ROLE,
      to: TARGET_ID,
      toModel: ROLE === "User" ? "Admin" : "User",
      text,
    });
    console.log(`📤 ${ROLE} message ${count} sent`);
    count++;
  }, 10000);
});

// استقبل أي رسائل
socket.on("receiveMessage", (msg) => {
  console.log(`📩 ${ROLE} received:`, msg);
});

socket.on("disconnect", (reason) => {
  console.log(`❌ ${ROLE} disconnected. Reason:`, reason);
});

socket.on("connect_error", (err) => {
  console.error(`⚠️ ${ROLE} connect error:`, err.message);
});
