import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { generatePassword } from '@/lib/password'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    // Generate password reminder (not reset - remind them of their password format)
    const password = generatePassword(user.firstName, user.lastName, user.birthYear)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Send email with password reminder
    await resend.emails.send({
      from: 'Family Tree <noreply@familytree.lol>',
      to: email,
      subject: 'Your Family Tree Password',
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
                letter-spacing: 4px;
                text-shadow: 0 0 20px rgba(127, 181, 127, 0.3);
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
              <h1>🔑 Password Reminder</h1>
            </div>
            <div class="content">
              <p style="color: #e5e7eb; font-size: 18px;">Hi ${user.firstName},</p>
              
              <p style="color: #e5e7eb;">You requested a reminder of your Family Tree password. Here it is:</p>
              
              <div class="password-box">
                <div class="password-label">Your Password</div>
                <div class="password">${password}</div>
              </div>
              
              <p style="text-align: center;">
                <a href="${appUrl}" class="cta-button">Login to Family Tree</a>
              </p>
              
              <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
                <strong>Password format:</strong> [first initial][last name][birth year (last 2 digits)]
              </p>
              
              <p style="color: #f59e0b; margin-top: 30px;">
                <strong>⚠️ If you didn't request this, please ignore this email.</strong>
              </p>
            </div>
            <div class="footer">
              <p>This email was sent from Family Tree</p>
              <p>${appUrl}</p>
            </div>
          </body>
        </html>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Password reminder sent to your email.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while sending the email' },
      { status: 500 }
    )
  }
}
