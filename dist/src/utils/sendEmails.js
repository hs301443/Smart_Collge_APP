"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, subject, text) => {
    console.log("Email user:", process.env.EMAIL_USER);
    console.log("Email pass:", process.env.EMAIL_PASS ? "Exists" : "Missing");
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    try {
        const info = await transporter.sendMail({
            from: `"Smart_collge" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });
        console.log("✅ Email sent:", info.response);
    }
    catch (error) {
        console.error("❌ Email error:", error);
    }
};
exports.sendEmail = sendEmail;
// import nodemailer from "nodemailer";
// export const sendEmail = async (to: string, subject: string, text: string) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: Number(process.env.EMAIL_PORT),
//     secure: false, // مع 587 لازم false
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
//   try {
//     const info = await transporter.sendMail({
//       from: `"Smart College" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//     });
//     console.log("✅ Email sent:", info.response);
//   } catch (error) {
//     console.error("❌ Email error:", error);
//   }
// }
