import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePassword, hashPassword } from '@/lib/password'
import { sendWelcomeEmail } from '@/lib/email'
import { fromDateInputValue } from '@/lib/date'

// POST /api/register - Public endpoint for users to self-register
export async function POST(request: NextRequest) {
  try {
    // Check if user has family password session
    const familyPasswordSession = request.cookies.get('family-password-session')?.value
    
    if (!familyPasswordSession || familyPasswordSession !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized - Family password required' }, { status: 401 })
    }

    const body = await request.json()
    let {
      firstName,
      lastName,
      email,
      birthYear,
      birthday,
      phone,
      address,
      shippingAddress,
      favoriteTeam,
      customCardText,
      parentId,
      parent2Id,
      friendId,
      relationshipType,
      profilePhotoUrl,
      socialMedia,
    } = body
    
    // Sanitize names - trim whitespace and remove linebreaks
    firstName = firstName?.trim().replace(/\s+/g, ' ')
    lastName = lastName?.trim().replace(/\s+/g, ' ')

    // Email is required for living members
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A member with this email already exists' },
        { status: 400 }
      )
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
        email,
        birthYear,
        birthday: fromDateInputValue(birthday),
        phone: phone || null,
        address: address || null,
        shippingAddress: shippingAddress || null,
        favoriteTeam: favoriteTeam || null,
        customCardText: customCardText || null,
        parentId: parentId || null,
        parent2Id: parent2Id || null,
        friendId: friendId || null,
        relationshipType: relationshipType || null,
        profilePhotoUrl: profilePhotoUrl || null,
        password: hashedPassword,
        isAdmin: false,
        isDeceased: false,
        ...socialUrls,
      },
    })

    // Send welcome email
    let emailResult: { success: boolean; error?: any; data?: any } = { success: true }
    emailResult = await sendWelcomeEmail({
      to: email,
      firstName,
      lastName,
      password,
    })

    if (!emailResult.success) {
      console.error('Error sending welcome email:', emailResult.error)
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
          error: 'Profile created but email delivery failed. Please check your email or contact an admin.',
          password, // Include password so it can be displayed to user
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
    console.error('Error creating registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
