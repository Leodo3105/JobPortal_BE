import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Mail options
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send mail
  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;