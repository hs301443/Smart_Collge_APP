"use strict";
// import nodemailer from "nodemailer";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
// export const sendEmail = async (to: string, subject: string, text: string) => {
//   console.log("Email user:", process.env.EMAIL_USER);
//   console.log("Email pass:", process.env.EMAIL_PASS ? "Exists" : "Missing");
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
//   try {
//     const info = await transporter.sendMail({
//       from: `"Smart_collge" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//     });
//     console.log("✅ Email sent:", info.response);
//   } catch (error) {
//     console.error("❌ Email error:", error);
//   }
// };
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
async function sendEmail(to, subject, text) {
    try {
        const data = await resend.emails.send({
            from: "Smart College <noreply@smartcollege.com>",
            to,
            subject,
            text,
        });
        console.log("✅ Email sent:", data);
    }
    catch (error) {
        console.error("❌ Email error:", error);
    }
}
