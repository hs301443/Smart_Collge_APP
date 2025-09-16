import { io } from "socket.io-client";

const URL = "https://smartcollgeapp-production.up.railway.app";

// اختار الدور هنا
const ROLE: "User" | "Admin" = "User"; // غيرها لـ "Admin" لو عايز تجرب الأدمن
const USER_ID = ROLE === "User" ? "123" : "admin1";
const TARGET_ID = ROLE === "User" ? "admin1" : "123";

// إنشاء الاتصال بالباك
const socket = io(URL, {
  transports: ["polling"], // مهم على Railway
  timeout: 20000,
  path: "/socket.io",
});

socket.on("connect", () => {
  console.log(`✅ ${ROLE} connected: ${socket.id}`);

  // تسجيل اليوزر/الأدمن
  socket.emit("register", { userId: USER_ID, role: ROLE });

  // إرسال رسالة كل 10 ثواني
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

// استقبال الرسائل الواردة
socket.on("receiveMessage", (msg) => {
  console.log(`📩 ${ROLE} received:`, msg);
});

// استقبال إشعارات القراءة أو الحذف
socket.on("messageSeen", (data) => console.log(`👀 Message seen:`, data));
socket.on("conversationRead", (data) => console.log(`✅ Conversation read:`, data));
socket.on("messageDeleted", (data) => console.log(`🗑️ Message deleted:`, data));
socket.on("conversationDeleted", (data) => console.log(`🗑️ Conversation deleted:`, data));

// Disconnect و أخطاء الاتصال
socket.on("disconnect", (reason) => console.log(`❌ ${ROLE} disconnected. Reason:`, reason));
socket.on("connect_error", (err) => console.error(`⚠️ ${ROLE} connect error:`, err.message));
