import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePassword, hashPassword } from '@/lib/password'
import { getCurrentUser } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { fromDateInputValue } from '@/lib/date'
import { apiCache } from '@/lib/cache'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    
    // Check if user is authenticated and is admin
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
      parentId,
      parent2Id,
      friendId,
      relationshipType,
      profilePhotoUrl,
      isDeceased,
      socialMedia, // { instagram?: string, facebook?: string, twitter?: string, linkedin?: string }
    } = body
    
    // Sanitize names - trim whitespace and remove linebreaks
    firstName = firstName?.trim().replace(/\s+/g, ' ')
    lastName = lastName?.trim().replace(/\s+/g, ' ')

    // Validate required fields
    if (!firstName || !lastName || !birthYear || !birthday) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For living members, email is required
    if (!isDeceased && !email) {
      return NextResponse.json(
        { error: 'Email is required for living members' },
        { status: 400 }
      )
    }

    // Generate placeholder email for deceased members if not provided
    const userEmail = email || `deceased.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@memorial.family`

    // Check if email already exists (only if a real email was provided)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Generate password
    const plainPassword = generatePassword(firstName, lastName, birthYear)
    const hashedPassword = await hashPassword(plainPassword)

    // Construct social media URLs from handles
    const socialUrls: {
      instagram?: string
      facebook?: string
      twitter?: string
      linkedin?: string
    } = {}

    if (socialMedia?.instagram) {
      socialUrls.instagram = `https://instagram.com/${socialMedia.instagram}`
    }
    if (socialMedia?.facebook) {
      socialUrls.facebook = `https://facebook.com/${socialMedia.facebook}`
    }
    if (socialMedia?.twitter) {
      socialUrls.twitter = `https://x.com/${socialMedia.twitter}`
    }
    if (socialMedia?.linkedin) {
      socialUrls.linkedin = `https://www.linkedin.com/in/${socialMedia.linkedin}`
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: userEmail,
        birthYear: parseInt(birthYear),
        birthday: fromDateInputValue(birthday),
        phone: phone || null,
        address: address || null,
        shippingAddress: shippingAddress || null,
        favoriteTeam: favoriteTeam || null,
        customCardText: body.customCardText || null,
        preferredContactMethod: body.preferredContactMethod || null,
        parentId: parentId || null,
        parent2Id: parent2Id || null,
        friendId: friendId || null,
        relationshipType: relationshipType || null,
        profilePhotoUrl: profilePhotoUrl || null,
        password: hashedPassword,
        isAdmin: false,
        isDeceased: isDeceased || false,
        ...socialUrls,
      },
    })

    // Send welcome email with password (only for living members with real email)
    let emailResult = { success: false }
    if (!isDeceased && email) {
      emailResult = await sendWelcomeEmail({
        to: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: plainPassword,
      })
    }

    // Invalidate users cache after creating new user
    apiCache.invalidatePattern('users-')

    // Return success with plain password (only time it's shown)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      password: plainPassword, // Only returned here, never logged
      emailSent: emailResult.success,
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'An error occurred while creating the user' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    const publicAccess = searchParams.get('public') === 'true'
    
    // For public access (join page), return limited info including birthday and parent info for age filtering
    if (publicAccess) {
      // Check cache first
      const cacheKey = 'users-public'
      const cached = apiCache.get(cacheKey)
      if (cached) {
        return NextResponse.json(cached)
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthday: true,
          parentId: true,
          parent2Id: true,
        },
        orderBy: {
          firstName: 'asc',
        },
      })
      
      // Cache for 5 minutes
      apiCache.set(cacheKey, users, 300)
      return NextResponse.json(users)
    }
    
    // Check if user is authenticated and is admin for full access
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check cache first
    const cacheKey = 'users-admin'
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthday: true,
        birthYear: true,
        phone: true,
        address: true,
        favoriteTeam: true,
        customCardText: true,
        preferredContactMethod: true,
        profilePhotoUrl: true,
        instagram: true,
        facebook: true,
        twitter: true,
        linkedin: true,
        parentId: true,
        parent2Id: true,
        friendId: true,
        relationshipType: true,
        isAdmin: true,
        isDeceased: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Cache for 2 minutes
    apiCache.set(cacheKey, users, 120)
    return NextResponse.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching users' },
      { status: 500 }
    )
  }
}
