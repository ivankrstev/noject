import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: "smtp.eu.mailgun.org",
  secure: true,
  auth: {
    user: "info@noject.live",
    pass: process.env.EMAIL_PASSWORD,
  },
  requireTls: true,
});

const sendVerifyEmail = (data) => {
  const { first_name, last_name, u_id, verification_token } = data;
  const verificationLink = `${process.env.EMAIL_CLIENT_URL}/verify-email?email=${u_id}&token=${verification_token}`;
  const mailOptions = {
    from: "Noject App info@noject.live",
    to: `${first_name} ${last_name} ${u_id}`,
    subject: "Email Verification",
    text: `Dear ${first_name},\n Please click on the following link to verify your email: ${verificationLink}`,
    html: `<p style="font-size:16px;color:#333;margin-bottom:10px;">Dear ${first_name},</p> <p style="font-size:14px;color:#555;margin-bottom:20px;">Please click on the following link to verify your email: </p> <a style="display:inline-block;padding:10px 20px;background-color:#337ab7;color:#fff;text-decoration:none;border-radius:4px;font-size:14px;" href="${verificationLink}">Verify Email</a>`,
    priority: "normal",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error sending verification email:", error);
    console.log(info);
  });
};

export default sendVerifyEmail;
