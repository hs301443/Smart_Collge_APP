"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
// utils/sendNotification.ts
const firebase_1 = require("./firebase");
const sendNotification = async (token, title, body) => {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            token,
        };
        const response = await firebase_1.messaging.send(message);
        console.log("✅ Notification sent:", response);
        return response;
    }
    catch (error) {
        console.error(" Error sending notification:", error);
    }
};
exports.sendNotification = sendNotification;
