import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generatePassword, hashPassword } from '@/lib/password'
import { sendWelcomeEmail } from '@/lib/email'
import { fromDateInputValue } from '@/lib/date'

// POST /api/admin/invite - Send invite email to new member
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      birthYear,
      birthday,
      phone,
      address,
      favoriteTeam,
      customCardText,
      parentId,
      parent2Id,
      friendId,
      profilePhotoUrl,
      isDeceased,
      socialMedia,
    } = body

    // For living members, email is required
    if (!isDeceased && !email) {
      return NextResponse.json(
        { error: 'Email is required for living members' },
        { status: 400 }
      )
    }

    // Generate placeholder email for deceased members if not provided
    const userEmail = email || `deceased.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@memorial.family`

    // Check if user already exists (only if a real email was provided)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'A member with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Generate password
    const password = generatePassword(firstName, lastName, birthYear)
    const hashedPassword = await hashPassword(password)

    // Build social media URLs
    const socialUrls: any = {}
    if (socialMedia) {
      if (socialMedia.instagram) {
        socialUrls.instagram = `https://instagram.com/${socialMedia.instagram}`
      }
      if (socialMedia.facebook) {
        socialUrls.facebook = `https://facebook.com/${socialMedia.facebook}`
      }
      if (socialMedia.twitter) {
        socialUrls.twitter = `https://x.com/${socialMedia.twitter}`
      }
      if (socialMedia.linkedin) {
        socialUrls.linkedin = `https://www.linkedin.com/in/${socialMedia.linkedin}`
      }
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: userEmail,
        birthYear,
        birthday: fromDateInputValue(birthday),
        phone: phone || null,
        address: address || null,
        favoriteTeam: favoriteTeam || null,
        customCardText: customCardText || null,
        parentId: parentId || null,
        parent2Id: parent2Id || null,
        friendId: friendId || null,
        profilePhotoUrl: profilePhotoUrl || null,
        password: hashedPassword,
        isAdmin: false,
        ...socialUrls,
      },
    })

    // Send welcome email (only for living members with real email)
    let emailResult: { success: boolean; error?: any; data?: any } = { success: true }
    if (!isDeceased && email) {
      emailResult = await sendWelcomeEmail({
        to: email,
        firstName,
        lastName,
        password,
      })
    }

    // Handle deceased members - no email sent
    if (isDeceased) {
      return NextResponse.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: email || userEmail,
        },
        emailSent: false,
        password, // Include password for deceased members too
      })
    }

    if (!emailResult.success) {
      console.error('Error sending invite email:', emailResult.error)
      // User was created but email failed - return partial success
      return NextResponse.json(
        {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          emailSent: false,
          error: 'User created but email delivery failed. Please share the password manually.',
          password, // Include password so admin can share it manually
        },
        { status: 207 } // Multi-status
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      emailSent: true,
    })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
