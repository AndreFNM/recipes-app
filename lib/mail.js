import nodemailer from 'nodemailer';

export async function sendResetPasswordEmail(to, token) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,  
      debug: true,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Password Reset Request',
      text: `To reset your password, click on the link: ${resetUrl}`,
      html: `<p>To reset your password, click on the link below:</p><p><a href="${resetUrl}">Reset Password</a></p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reset password email sent successfully:", info);
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw new Error("Failed to send reset password email");
  }
}
