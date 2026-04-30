interface WelcomeClientPayload {
  email: string;
  name: string;
  portalUrl: string;
}

export function welcomeClientTemplate(payload: WelcomeClientPayload): string {
  const { email, name, portalUrl } = payload;
  const firstName = (name && name !== 'undefined' && name !== 'undefined undefined') ? name.split(' ')[0] : 'there';
  const logoUrl = 'https://ik.imagekit.io/pinecone/SmartCaf/logo.png?updatedAt=1777569129907';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Smart CAF</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .content { padding: 30px 20px !important; }
      .feature-item { padding: 15px !important; }
    }
    body { margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; padding-bottom: 40px; }
    .logo { height: 120px; width: auto; }
    .content { background: #ffffff; border: none; padding: 48px; }
    .title { margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
    .text { margin: 0 0 32px; color: #4B5563; font-size: 16px; line-height: 1.6; }
    .features { margin: 0 0 32px; }
    .feature-item { background: #F3F4F6; border-radius: 0; padding: 20px; margin-bottom: 12px; display: block; text-decoration: none; }
    .feature-title { display: block; color: #111827; font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .feature-desc { display: block; color: #6B7280; font-size: 12px; line-height: 1.4; }
    .cta-container { text-align: center; margin-top: 32px; }
    .cta-button { display: inline-block; background: #000000; color: #ffffff; padding: 18px 40px; border-radius: 0; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; transition: transform 0.2s; }
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
      <h1 class="title">You're in, ${firstName}.</h1>
      <p class="text">Your account is now active. You can now access all Smart CAF digital services directly from your dashboard.</p>
      
      <div class="features">
        <div class="feature-item">
          <span class="feature-title">Smart Submissions</span>
          <span class="feature-desc">Submit and track your applications with real-time updates.</span>
        </div>
        <div class="feature-item">
          <span class="feature-title">Secure Vault</span>
          <span class="feature-desc">Manage all your fiscal documents and attachments in one place.</span>
        </div>
        <div class="feature-item">
          <span class="feature-title">Expert Support</span>
          <span class="feature-desc">Direct line of communication with your assigned fiscal agent.</span>
        </div>
      </div>

      <div class="cta-container">
        <a href="${portalUrl}" class="cta-button" style="color: #ffffff !important;">Open Your Portal →</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">Need assistance? <a href="mailto:support@smartcaf.it" class="footer-link">support@smartcaf.it</a></p>
      <p class="footer-text" style="margin-top: 8px;">© ${new Date().getFullYear()} Smart CAF. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
