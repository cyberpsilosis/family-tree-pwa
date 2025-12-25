import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://familytree.lol'
// Use onboarding@resend.dev for testing, or custom domain if verified
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Family Tree <onboarding@resend.dev>'

interface SendWelcomeEmailParams {
  to: string
  firstName: string
  lastName: string
  password: string
}

export async function sendWelcomeEmail({
  to,
  firstName,
  lastName,
  password,
}: SendWelcomeEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to the Family Tree!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #e5e7eb;
                background: #0a0a0a;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #7FB57F 0%, #5a8a5a 100%);
                color: white;
                padding: 30px 20px;
                border-radius: 12px 12px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                background: #1a1a1a;
                padding: 30px;
                border: 1px solid #2a2a2a;
                border-top: none;
                border-radius: 0 0 12px 12px;
              }
              .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #e5e7eb;
              }
              .password-box {
                background: linear-gradient(135deg, rgba(127, 181, 127, 0.1) 0%, rgba(90, 138, 90, 0.1) 100%);
                border: 2px solid #7FB57F;
                border-radius: 12px;
                padding: 32px 20px;
                margin: 30px 0;
                text-align: center;
                box-shadow: 0 8px 32px rgba(127, 181, 127, 0.2);
              }
              .password-label {
                font-size: 16px;
                color: #9ca3af;
                margin-bottom: 16px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .password {
                font-family: 'Courier New', monospace;
                font-size: 32px;
                font-weight: bold;
                color: #7FB57F;
                text-shadow: 0 0 20px rgba(127, 181, 127, 0.3);
                word-break: keep-all;
                white-space: nowrap;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #7FB57F 0%, #5a8a5a 100%);
                color: white;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                font-size: 16px;
                box-shadow: 0 4px 16px rgba(127, 181, 127, 0.3);
              }
              .instructions {
                background: rgba(245, 158, 11, 0.1);
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .instructions h3 {
                margin-top: 0;
                color: #fbbf24;
                font-size: 16px;
              }
              .instructions ol {
                margin: 10px 0;
                padding-left: 20px;
              }
              .instructions li {
                margin: 8px 0;
                color: #d4d4d4;
              }
              .instructions p {
                color: #d4d4d4;
                margin: 8px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #2a2a2a;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🌳 Family Tree</h1>
            </div>
            <div class="content">
              <p class="greeting">Hi ${firstName},</p>
              
              <p>Welcome to the Family Tree! Your account has been created and you now have access to our family directory.</p>
              
              <div class="password-box">
                <div class="password-label">Your Login Password</div>
                <div class="password">${password}</div>
              </div>
              
              <p style="text-align: center;">
                <a href="${APP_URL}" class="cta-button">Open Family Tree</a>
              </p>
              
              <div class="instructions">
                <h3>📱 Add to Your Phone's Home Screen</h3>
                <p><strong>iPhone/iPad:</strong></p>
                <ol>
                  <li>Open the link above in Safari</li>
                  <li>Tap the Share button (square with arrow)</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
                
                <p><strong>Android:</strong></p>
                <ol>
                  <li>Open the link above in Chrome</li>
                  <li>Tap the three dots menu</li>
                  <li>Tap "Add to Home screen" or "Install app"</li>
                  <li>Tap "Add"</li>
                </ol>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
                <strong>Note:</strong> Keep this password safe. You can change it after your first login.
              </p>
            </div>
            <div class="footer">
              <p>This email was sent from Family Tree</p>
              <p>${APP_URL}</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

interface SendPasswordResetEmailParams {
  to: string
  firstName: string
  newPassword: string
}

export async function sendPasswordResetEmail({
  to,
  firstName,
  newPassword,
}: SendPasswordResetEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your Family Tree Password Has Been Updated',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #e5e7eb;
                background: #0a0a0a;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #7FB57F 0%, #5a8a5a 100%);
                color: white;
                padding: 30px 20px;
                border-radius: 12px 12px 0 0;
                text-align: center;
              }
              .content {
                background: #1a1a1a;
                padding: 30px;
                border: 1px solid #2a2a2a;
                border-top: none;
                border-radius: 0 0 12px 12px;
              }
              .password-box {
                background: linear-gradient(135deg, rgba(127, 181, 127, 0.1) 0%, rgba(90, 138, 90, 0.1) 100%);
                border: 2px solid #7FB57F;
                border-radius: 12px;
                padding: 32px 20px;
                margin: 30px 0;
                text-align: center;
                box-shadow: 0 8px 32px rgba(127, 181, 127, 0.2);
              }
              .password-label {
                font-size: 16px;
                color: #9ca3af;
                margin-bottom: 16px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .password {
                font-family: 'Courier New', monospace;
                font-size: 32px;
                font-weight: bold;
                color: #7FB57F;
                text-shadow: 0 0 20px rgba(127, 181, 127, 0.3);
                word-break: keep-all;
                white-space: nowrap;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #7FB57F 0%, #5a8a5a 100%);
                color: white;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                box-shadow: 0 4px 16px rgba(127, 181, 127, 0.3);
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #2a2a2a;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🔐 Password Updated</h1>
            </div>
            <div class="content">
              <p style="color: #e5e7eb;">Hi ${firstName},</p>
              
              <p style="color: #e5e7eb;">Your account details have been updated by an administrator. Here is your new login password:</p>
              
              <div class="password-box">
                <div class="password-label">Your New Password</div>
                <div class="password">${newPassword}</div>
              </div>
              
              <p style="text-align: center;">
                <a href="${APP_URL}" class="cta-button">Login to Family Tree</a>
              </p>
              
              <p style="color: #dc2626; margin-top: 30px;">
                <strong>⚠️ If you did not request this change, please contact your administrator immediately.</strong>
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error }
  }
}
