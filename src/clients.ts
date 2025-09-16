import { io } from "socket.io-client";

const URL = "https://smartcollgeapp-production.up.railway.app";

const USER_ID = "123";
const ADMIN_ID = "admin1";

const userSocket = io(URL, { transports: ["polling"], timeout: 20000, path: "/socket.io" });
const adminSocket = io(URL, { transports: ["polling"], timeout: 20000, path: "/socket.io" });

userSocket.on("connect", () => {
  console.log(`✅ User connected: ${userSocket.id}`);
  userSocket.emit("register", { userId: USER_ID, role: "User" });

  let count = 1;
  setInterval(() => {
    const text = `Hello from User! Message ${count}`;
    userSocket.emit("sendMessage", {
      from: USER_ID,
      fromModel: "User",
      to: ADMIN_ID,
      toModel: "Admin",
      text,
    }, (ack: any) => {  // هنا استلام ACK
      console.log(`✅ User confirmed message ${count} delivered:`, ack);
    });
    console.log(`📤 User message ${count} sent`);
    count++;
  }, 10000);
});

adminSocket.on("connect", () => {
  console.log(`✅ Admin connected: ${adminSocket.id}`);
  adminSocket.emit("register", { userId: ADMIN_ID, role: "Admin" });

  let count = 1;
  setInterval(() => {
    const text = `Hello from Admin! Message ${count}`;
    adminSocket.emit("sendMessage", {
      from: ADMIN_ID,
      fromModel: "Admin",
      to: USER_ID,
      toModel: "User",
      text,
    }, (ack: any) => {  // ACK من الباك
      console.log(`✅ Admin confirmed message ${count} delivered:`, ack);
    });
    console.log(`📤 Admin message ${count} sent`);
    count++;
  }, 10000);
});

// استقبال الرسائل
const setupListeners = (socket: any, role: "User" | "Admin") => {
  socket.on("receiveMessage", (msg: any) => {
    console.log(`📩 ${role} received:`, msg.text);
  });
  socket.on("disconnect", (reason: any) => console.log(`❌ ${role} disconnected. Reason:`, reason));
  socket.on("connect_error", (err: any) => console.error(`⚠️ ${role} connect error:`, err.message));
};

setupListeners(userSocket, "User");
setupListeners(adminSocket, "Admin");
