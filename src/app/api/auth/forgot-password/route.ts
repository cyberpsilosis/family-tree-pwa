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
      from: 'Family Tree <noreply@yourdomain.com>',
      to: email,
      subject: 'Your Family Tree Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7FB57F;">Password Reminder</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your password for Family Tree is:</p>
          <p style="font-size: 24px; font-weight: bold; color: #5A8D5A; padding: 16px; background: #f5f5f5; border-radius: 8px; text-align: center;">
            ${password}
          </p>
          <p>Password format: [first initial][last name][birth year (last 2 digits)]</p>
          <p>
            <a href="${appUrl}" style="display: inline-block; padding: 12px 24px; background: #7FB57F; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
              Go to Family Tree
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 32px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
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
