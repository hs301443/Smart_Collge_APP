import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log("Email user:", process.env.EMAIL_USER);
  console.log("Email pass:", process.env.EMAIL_PASS ? "Exists" : "Missing");

  const transporter = nodemailer.createTransport({
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
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};


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