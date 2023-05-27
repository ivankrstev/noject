import { createTransport } from "nodemailer";

const transporter = createTransport({
  service: "outlook",
  auth: {
    user: "noject@outlook.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerifyEmail = (data) => {
  const verificationLink = `http://localhost:3000/verify-email?email=${data.u_id}&token=${data.verification_token}`;
  const mailOptions = {
    from: "Noject App noject@outlook.com",
    to: `${data.first_name} ${data.last_name} ${data.u_id}`,
    subject: "Email Verification",
    text: `Hello ${data.first_name},\n Please click on the following link to verify your email: ${verificationLink}`,
    html: `<p>Hello ${data.first_name},</p><p>Please click on the following link to verify your email:</p> <a href="${verificationLink}">${verificationLink}</a>`,
    amp: `<!doctype html>
    <html ⚡4email>
      <head>
        <meta charset="utf-8">
        <style amp4email-boilerplate>body{visibility:hidden}</style>
        <script async src="https://cdn.ampproject.org/v0.js"></script>
      </head>
      <body>
        <p>Hello ${data.first_name},</p>
        <p>Please click on the following link to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      </body>
    </html>`,
    priority: "normal",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error sending verification email:", error);
    console.log(info);
  });
};

export default sendVerifyEmail;
