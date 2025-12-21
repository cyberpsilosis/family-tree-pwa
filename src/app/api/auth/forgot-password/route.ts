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
        <h2>Password Reminder</h2>
        <p>Hello ${user.firstName},</p>
        <p>Your password for Family Tree is:</p>
        <p><strong>Password:</strong> <code style="background: #f4f4f4; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${password}</code></p>
        
        <p>Password format: [first initial][last name][birth year (last 2 digits)]</p>
        
        <p>Click the link below to access the app:</p>
        <p><a href="${appUrl}" style="display: inline-block; background: #7FB57F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Open Family Tree App</a></p>
        
        <p style="color: #666; font-size: 14px; margin-top: 32px;">
          If you didn't request this, please ignore this email.
        </p>
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
