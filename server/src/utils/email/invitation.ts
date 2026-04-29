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
  const joinUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/onboarding?token=${token}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join Smart CAF</title>
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
                    <p style="margin: 2px 0 0; color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Staff Portal</p>
                  </td>
                  <td align="right">
                    <div style="width: 40px; height: 40px; background-color: #6366f1; border-radius: 12px; text-align: center; line-height: 40px; font-size: 20px;">
                      ✨
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 48px; border-left: 1px solid #e8e8e8; border-right: 1px solid #e8e8e8;">
              <p style="margin: 0 0 12px; color: #0a0a0a; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Welcome to the Team,</p>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                <strong>${adminName}</strong> has invited you to join the Smart CAF team as an <strong>${role}</strong>. 
                Our staff portal allows you to manage citizen applications, verify payments, and orchestrate documents seamlessly.
              </p>

              <!-- Invitation Details -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 16px; color: #9ca3af; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Invitation Snapshot</p>
                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding-bottom: 8px; color: #6b7280; font-size: 13px;">Designated Email</td>
                    <td align="right" style="padding-bottom: 8px; color: #111827; font-size: 13px; font-weight: 600;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px; color: #6b7280; font-size: 13px;">Assigned Role</td>
                    <td align="right" style="padding-bottom: 8px; color: #6366f1; font-size: 13px; font-weight: 700; text-transform: uppercase;">${role}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px; color: #6b7280; font-size: 13px;">Expires In</td>
                    <td align="right" style="padding-bottom: 8px; color: #ef4444; font-size: 13px; font-weight: 600;">48 Hours</td>
                  </tr>
                </table>
              </div>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 12px; background-color: #0a0a0a;">
                    <a href="${joinUrl}"
                       style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 12px;">
                      Complete Onboarding →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px;">
                If you were not expecting this invitation, you can safely ignore this email. 
                The link will automatically expire in 48 hours.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 48px; border-radius: 0 0 20px 20px; border: 1px solid #e8e8e8; border-top: none; text-align: center;">
              <p style="margin: 0; color: #d1d5db; font-size: 11px;">© ${new Date().getFullYear()} Smart CAF Team. All rights reserved.</p>
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
