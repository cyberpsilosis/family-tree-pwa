import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'
import { generatePassword } from '@/lib/password'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        birthYear: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate new password
    const password = generatePassword(user.firstName, user.lastName, user.birthYear)

    // Send welcome email
    const emailResult = await sendWelcomeEmail({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resending invite:', error)
    return NextResponse.json(
      { error: 'Failed to resend invite' },
      { status: 500 }
    )
  }
}
