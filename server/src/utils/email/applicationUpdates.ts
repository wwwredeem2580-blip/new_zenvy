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

  let title = '';
  let message = '';
  let icon = '🔔';
  let accentColor = '#0a0a0a';

  switch (updateType) {
    case 'PAYMENT_APPROVED':
      title = 'Payment Approved';
      message = `Great news! Your payment for application <strong style="color: #0a0a0a;">#${applicationId}</strong> has been verified and approved. Our team will now begin the review process.`;
      icon = '✅';
      accentColor = '#10b981'; // Emerald
      break;
    case 'PAYMENT_REJECTED':
      title = 'Payment Issue';
      message = `There was an issue verifying your payment for application <strong style="color: #0a0a0a;">#${applicationId}</strong>. Please log in to the portal to check the details and retry if necessary.`;
      icon = '⚠️';
      accentColor = '#ef4444'; // Rose
      break;
    case 'STATUS_UPDATED':
      title = 'Status Update';
      message = `The status of your application <strong style="color: #0a0a0a;">#${applicationId}</strong> has been updated to <strong style="color: #0a0a0a; text-transform: uppercase;">${newStatus}</strong>.`;
      icon = '📋';
      accentColor = '#6366f1'; // Indigo
      break;
    case 'AGENT_ASSIGNED':
      title = 'Review Started';
      message = `Your application <strong style="color: #0a0a0a;">#${applicationId}</strong> is now being reviewed by <strong style="color: #0a0a0a;">${agentName}</strong>. You will be notified of any further updates or if additional documentation is required.`;
      icon = '🔍';
      accentColor = '#f59e0b'; // Amber
      break;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Smart CAF</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 48px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; margin: 0 auto;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 32px 48px; border-radius: 20px 20px 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Smart CAF</p>
                    <p style="margin: 2px 0 0; color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Notification Center</p>
                  </td>
                  <td align="right">
                    <div style="width: 40px; height: 40px; background-color: ${accentColor}; border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">
                      ${icon}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 48px; border-left: 1px solid #e8e8e8; border-right: 1px solid #e8e8e8;">
              <p style="margin: 0 0 12px; color: #0a0a0a; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Hi ${displayName},</p>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">${message}</p>

              <!-- Application Summary -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 16px; color: #9ca3af; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Application Snapshot</p>
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding-bottom: 8px; color: #6b7280; font-size: 13px;">ID</td>
                    <td align="right" style="padding-bottom: 8px; color: #111827; font-size: 13px; font-weight: 600;">#${applicationId}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px; color: #6b7280; font-size: 13px;">Update Type</td>
                    <td align="right" style="padding-bottom: 8px; color: #111827; font-size: 13px; font-weight: 600;">${title}</td>
                  </tr>
                  ${newStatus ? `
                  <tr>
                    <td style="padding-bottom: 8px; color: #6b7280; font-size: 13px;">Current Status</td>
                    <td align="right" style="padding-bottom: 8px; color: ${accentColor}; font-size: 13px; font-weight: 700; text-transform: uppercase;">${newStatus}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 12px; background-color: #0a0a0a;">
                    <a href="${process.env.CLIENT_URL || 'https://smartcaf.it'}/profile"
                       style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 12px;">
                      View Application Details →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 48px; border-radius: 0 0 20px 20px; border: 1px solid #e8e8e8; border-top: none; text-align: center;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">If you have any questions, reply to this email or contact support.</p>
              <p style="margin: 0; color: #d1d5db; font-size: 11px;">© ${new Date().getFullYear()} Smart CAF Portal. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}
