/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface ApplicationUpdatePayload {
  email: string;
  name: string;
  applicationId: string;
  updateType: 'PAYMENT_APPROVED' | 'PAYMENT_REJECTED' | 'STATUS_UPDATED' | 'AGENT_ASSIGNED';
  newStatus?: string;
  agentName?: string;
  services?: string[];
}

export function applicationUpdateTemplate(payload: ApplicationUpdatePayload): string {
  const { email, name, applicationId, updateType, newStatus, agentName, services } = payload;
  const displayName = name ? name.split(' ')[0] : 'there';
  const logoUrl = 'https://ik.imagekit.io/pinecone/SmartCaf/logo.png?updatedAt=1777569129907';

  let title = '';
  let message = '';
  let accentColor = '#000000';

  switch (updateType) {
    case 'PAYMENT_APPROVED':
      title = 'Payment Approved';
      message = `Your payment for application <strong style="color: #000000;">#${applicationId}</strong> has been successfully verified. Our team is now moving forward with your request.`;
      accentColor = '#10B981';
      break;
    case 'PAYMENT_REJECTED':
      title = 'Payment Issue';
      message = `We encountered an issue verifying your payment for application <strong style="color: #000000;">#${applicationId}</strong>. Please visit the portal to resolve this.`;
      accentColor = '#EF4444';
      break;
    case 'STATUS_UPDATED':
      title = 'Status Update';
      message = `The status of your application <strong style="color: #000000;">#${applicationId}</strong> has been updated to <strong style="color: #000000; text-transform: uppercase;">${newStatus}</strong>.`;
      accentColor = '#6366F1';
      break;
    case 'AGENT_ASSIGNED':
      title = 'Review Started';
      message = `Your application <strong style="color: #000000;">#${applicationId}</strong> is now being processed by <strong style="color: #000000;">${agentName}</strong>. You'll hear from us soon.`;
      accentColor = '#F59E0B';
      break;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
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
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; color: white; background-color: ${accentColor}; }
    .title { margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
    .text { margin: 0 0 32px; color: #4B5563; font-size: 16px; line-height: 1.6; }
    .cta-container { text-align: center; }
    .cta-button { display: inline-block; background: #000000; color: #ffffff; padding: 18px 40px; border-radius: 0; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; }
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
      <div class="status-badge">${title}</div>
      <h1 class="title">Update on #${applicationId}</h1>
      <p class="text">Hi ${displayName},<br><br>${message}</p>
      
      <div class="cta-container">
        <a href="${process.env.CLIENT_URL || 'https://smartcaf.it'}/profile" class="cta-button">View Details →</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">Questions? Reply to this email or contact our support team.</p>
      <p class="footer-text" style="margin-top: 16px;">© ${new Date().getFullYear()} Smart CAF. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
