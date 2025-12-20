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
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #A3D5A3 0%, #7FB57F 100%);
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
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 12px 12px;
              }
              .greeting {
                font-size: 18px;
                margin-bottom: 20px;
              }
              .password-box {
                background: #f9fafb;
                border: 2px solid #A3D5A3;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                text-align: center;
              }
              .password-label {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
              }
              .password {
                font-family: 'Courier New', monospace;
                font-size: 24px;
                font-weight: bold;
                color: #2C3E2C;
                letter-spacing: 2px;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #A3D5A3 0%, #7FB57F 100%);
                color: white;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                font-size: 16px;
              }
              .instructions {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .instructions h3 {
                margin-top: 0;
                color: #92400e;
                font-size: 16px;
              }
              .instructions ol {
                margin: 10px 0;
                padding-left: 20px;
              }
              .instructions li {
                margin: 8px 0;
                color: #78350f;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
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
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
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
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #A3D5A3 0%, #7FB57F 100%);
                color: white;
                padding: 30px 20px;
                border-radius: 12px 12px 0 0;
                text-align: center;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 12px 12px;
              }
              .password-box {
                background: #f9fafb;
                border: 2px solid #A3D5A3;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                text-align: center;
              }
              .password {
                font-family: 'Courier New', monospace;
                font-size: 24px;
                font-weight: bold;
                color: #2C3E2C;
                letter-spacing: 2px;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #A3D5A3 0%, #7FB57F 100%);
                color: white;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🔐 Password Updated</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>Your account details have been updated by an administrator. Here is your new login password:</p>
              
              <div class="password-box">
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
