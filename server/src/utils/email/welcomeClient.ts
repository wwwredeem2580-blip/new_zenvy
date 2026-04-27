interface WelcomeClientPayload {
  email: string;
  name: string;
  portalUrl: string;
}

export function welcomeClientTemplate(payload: WelcomeClientPayload): string {
  const { email, name, portalUrl } = payload;
  const firstName = name.split(' ')[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>You're verified — Smart CAF</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'DM Sans', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 48px 20px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; margin: 0 auto;">

          <!-- Header -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 36px 48px; border-radius: 16px 16px 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Smart CAF</p>
                    <p style="margin: 4px 0 0; color: rgba(255,255,255,0.45); font-size: 11px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase;">Patronato Digitale</p>
                  </td>
                  <td align="right">
                    <div style="width: 36px; height: 36px; background-color: rgba(255,255,255,0.12); border-radius: 8px; display: inline-block; text-align: center; line-height: 36px;">
                      <span style="color: #ffffff; font-size: 18px;">✓</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 48px 48px 40px; border-left: 1px solid #e8e8e8; border-right: 1px solid #e8e8e8;">

              <p style="margin: 0 0 8px; color: #0a0a0a; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                You're in, ${firstName}.
              </p>

              <p style="margin: 0 0 28px; color: #555555; font-size: 15px; line-height: 1.7;">
                Your email address has been successfully verified. Your Smart CAF account is now active and ready to use.
              </p>

              <!-- What's available -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px; background-color: #f7f7f7; border-radius: 12px; padding: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; color: #888888; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;">Via the Portal you can</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 6px 0;">
                          <p style="margin: 0; color: #0a0a0a; font-size: 14px; line-height: 1.5;">
                            <span style="color: #0a0a0a; margin-right: 10px;">→</span> Submit and track service applications
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <p style="margin: 0; color: #0a0a0a; font-size: 14px; line-height: 1.5;">
                            <span style="color: #0a0a0a; margin-right: 10px;">→</span> Manage documents and attachments
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <p style="margin: 0; color: #0a0a0a; font-size: 14px; line-height: 1.5;">
                            <span style="color: #0a0a0a; margin-right: 10px;">→</span> Communicate directly with your assigned agent
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius: 10px; background-color: #0a0a0a;">
                    <a href="${portalUrl}"
                       style="display: inline-block; padding: 16px 36px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.03em; border-radius: 10px;">
                      Go to Portal →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7f7f7; padding: 24px 48px; border-radius: 0 0 16px 16px; border: 1px solid #e8e8e8; border-top: none;">
              <p style="margin: 0 0 4px; color: #aaaaaa; font-size: 12px; text-align: center;">
                Need help? <a href="mailto:support@smartcaf.it" style="color: #0a0a0a; text-decoration: none; font-weight: 600;">support@smartcaf.it</a>
              </p>
              <p style="margin: 0; color: #cccccc; font-size: 11px; text-align: center;">
                © ${new Date().getFullYear()} Smart CAF. All rights reserved.
              </p>
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
