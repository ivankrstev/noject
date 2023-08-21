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

const sendReminderEmail = (data) => {
  const { first_name, last_name, ru_id, value, reminder_time } = data;
  const mailOptions = {
    from: "Noject App info@noject.live",
    to: `${first_name} ${last_name} ${ru_id}`,
    subject: "Email Verification",
    text: `Hello ${first_name},\nThis is a friendly reminder that your task "${value}" is due on ${reminder_time}.\n Please make sure to complete it before the due date to stay on track.\nThank you!`,
    html: `<p>Hello ${first_name},</p><p>This is a friendly reminder that your task "${value}" is due on ${reminder_time}. Please make sure to complete it before the due date to stay on track.</p><p>Thank you!</p>`,
    priority: "normal",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error sending verification email:", error);
    console.log(info);
  });
};

export default sendReminderEmail;
