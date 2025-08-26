import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log("Email user:", process.env.EMAIL_USER);
  console.log("Email pass:", process.env.EMAIL_PASS ? "Exists" : "Missing");

  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // لازم true عشان 465
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
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};


// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY!);

// export async function sendEmail(to: string, subject: string, text: string) {
//   try {
//     const data = await resend.emails.send({
//       from: "Smart College <noreply@smartcollege.com>", 
//       to,
//       subject,
//       text,
//     });

//     console.log("✅ Email sent:", data);
//   } catch (error) {
//     console.error("❌ Email error:", error);
//   }
// }
