/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface InvitationPayload {
  email: string;
  role: string;
  token: string;
  adminName: string;
}

export function invitationTemplate(payload: InvitationPayload): string {
  const { email, role, token, adminName } = payload;
  const logoUrl = 'https://ik.imagekit.io/pinecone/SmartCaf/logo.png?updatedAt=1777569129907';
  const joinUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/onboarding?token=${token}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Join Smart CAF</title>
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
    .text { margin: 0 0 32px; color: #4B5563; font-size: 16px; line-height: 1.6; }
    .info-grid { background: #F3F4F6; border-radius: 0; padding: 24px; margin-bottom: 32px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .info-label { color: #6B7280; font-size: 12px; font-weight: 500; }
    .info-value { color: #111827; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .cta-container { text-align: center; }
    .cta-button { display: inline-block; background: #000000; color: #ffffff; padding: 18px 40px; border-radius: 0; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; }
    .footer { padding-top: 32px; text-align: center; }
    .footer-text { margin: 0; color: #9CA3AF; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Smart CAF" class="logo">
    </div>
    <div class="content">
      <h1 class="title">Join the team.</h1>
      <p class="text">Hi there,<br><br>${adminName} has invited you to join the Smart CAF team. You'll be able to manage applications, coordinate with citizens, and streamline fiscal processes.</p>
      
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">${email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Assigned Role</span>
          <span class="info-value">${role}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Expires In</span>
          <span class="info-value" style="color: #EF4444;">48 Hours</span>
        </div>
      </div>

      <div class="cta-container">
        <a href="${joinUrl}" class="cta-button" style="color: #ffffff !important;">Accept Invitation →</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">If you weren't expecting this, you can safely ignore this email.</p>
      <p class="footer-text" style="margin-top: 16px;">© ${new Date().getFullYear()} Smart CAF Team. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
