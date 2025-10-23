// utils/sendNotification.ts
import { messaging } from "./firebase";

export const sendNotification = async (token: string, title: string, body: string) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    const response = await messaging.send(message);
    console.log("✅ Notification sent:", response);
    return response;
  } catch (error) {
    console.error(" Error sending notification:", error);
  }
};
