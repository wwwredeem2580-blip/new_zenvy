/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface AgentAssistedWelcomePayload {
  email: string;
  name: string;
  claimUrl: string;
}

export function agentAssistedWelcomeTemplate(payload: AgentAssistedWelcomePayload): string {
  const { email, name, claimUrl } = payload;
  const logoUrl = 'https://ik.imagekit.io/pinecone/SmartCaf/smartcaf_dark.png?updatedAt=1777571162166';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Smart CAF</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; padding: 48px 0; background: #ffffff; }
    .logo { height: 120px; width: auto; }
    .content { background: #ffffff; padding: 48px; }
    .title { margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
    .text { margin: 0 0 32px; color: #4B5563; font-size: 16px; line-height: 1.6; }
    .cta-button { display: inline-block; background: #000000; color: #ffffff; padding: 18px 40px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; }
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
      <h1 class="title">Welcome, ${name}.</h1>
      <p class="text">An agent has created a Smart CAF portal account for you to manage your applications. Please click the button below to secure your account and set your password.</p>
      
      <div style="text-align: center;">
        <a href="${claimUrl}" class="cta-button" style="color: #ffffff !important;">Secure My Account →</a>
      </div>
      
      <p class="text" style="margin-top: 32px; font-size: 14px; color: #6B7280;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${claimUrl}" style="color: #6366F1;">${claimUrl}</a>
      </p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} Smart CAF Team. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
