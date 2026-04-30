interface EmailVerificationPayload {
  email: string;
  verificationLink: string;
  name?: string;
}

export function emailVerificationTemplate(payload: EmailVerificationPayload): string {
  const { email, verificationLink, name } = payload;
  const displayName = name ? name.split(' ')[0] : null;
  const logoUrl = 'https://ik.imagekit.io/pinecone/SmartCaf/logo.png?updatedAt=1777569129907';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify Your Email</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .content { padding: 30px 20px !important; }
    }
    body { margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; padding-bottom: 40px; }
    .logo { height: 120px; width: auto; }
    .content { background: #ffffff; border: none; padding: 48px; }
    .title { margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
    .text { margin: 0 0 24px; color: #4B5563; font-size: 16px; line-height: 1.6; }
    .email-box { background: #F3F4F6; border-radius: 0; padding: 16px; margin-bottom: 32px; text-align: center; }
    .email-text { color: #111827; font-size: 14px; font-weight: 600; }
    .cta-container { text-align: center; margin-bottom: 32px; }
    .cta-button { display: inline-block; background: #000000; color: #ffffff; padding: 18px 40px; border-radius: 0; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; }
    .fallback { border-top: 1px solid #E5E7EB; pt-24; margin-top: 32px; padding-top: 24px; }
    .fallback-text { color: #9CA3AF; font-size: 12px; margin-bottom: 8px; }
    .fallback-link { color: #6B7280; font-size: 11px; word-break: break-all; }
    .footer { padding-top: 32px; text-align: center; }
    .footer-text { margin: 0; color: #9CA3AF; font-size: 12px; }
    .footer-link { color: #111827; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Smart CAF" class="logo">
    </div>
    <div class="content">
      <h1 class="title">Verify your email.</h1>
      <p class="text">Hi ${displayName || 'there'}, please verify your email address to activate your Smart CAF account and start your fiscal journey.</p>
      
      <div class="email-box">
        <span class="email-text">${email}</span>
      </div>

      <div class="cta-container">
        <a href="${verificationLink}" class="cta-button">Verify Email Address →</a>
      </div>

      <div class="fallback">
        <p class="fallback-text">Or copy and paste this link into your browser:</p>
        <p class="fallback-link">${verificationLink}</p>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">This link expires in 24 hours. Didn't request this? Ignore this email.</p>
      <p class="footer-text" style="margin-top: 16px;">© ${new Date().getFullYear()} Smart CAF. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
