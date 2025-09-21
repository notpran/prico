import nodemailer from 'nodemailer';

// This is a mock email service. In a real application, you would use a
// service like SendGrid, Mailgun, or AWS SES.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const verificationLink = `http://localhost:3001/api/auth/verify?token=${token}`;
  console.log(`Sending verification email to ${to} with link: ${verificationLink}`);
  
  // In a real app, you would send an HTML email
  await transporter.sendMail({
    from: '"Prico" <noreply@prico.app>',
    to,
    subject: 'Verify your email for Prico',
    text: `Please verify your email by clicking this link: ${verificationLink}`,
    html: `<p>Please verify your email by clicking this link: <a href="${verificationLink}">${verificationLink}</a></p>`,
  });
}
