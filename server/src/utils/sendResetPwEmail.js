import { createTransport } from "nodemailer";

const transporter = createTransport({
  service: "outlook",
  auth: {
    user: "noject@outlook.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendResetPwEmail = (data) => {
  const { first_name, last_name, u_id, verification_token } = data;
  const verificationLink = `http://localhost:3000/reset-password?token=${verification_token}`;
  const mailOptions = {
    from: "Noject App noject@outlook.com",
    to: `${first_name} ${last_name} ${u_id}`,
    subject: "Password Reset Instructions",
    text: `Dear ${first_name},\n Please click on the following link to reset your password: ${verificationLink}`,
    html: `<p style="font-size:16px;color:#333;margin-bottom:10px;">Dear ${first_name},</p><p style="font-size:14px;color:#555;margin-bottom:20px;">Please click on the following link to reset your password:</p><a style="display:inline-block;padding:10px 20px;background-color:#337ab7;color:#fff;text-decoration:none;border-radius:4px;font-size:14px;" href="${verificationLink}">Reset Password</a>`,
    priority: "normal",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error sending verification email:", error);
    console.log(info);
  });
};

export default sendResetPwEmail;
