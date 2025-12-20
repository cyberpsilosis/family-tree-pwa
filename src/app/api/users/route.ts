import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePassword, hashPassword } from '@/lib/password'
import { getCurrentUser } from '@/lib/auth'

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
    const {
      firstName,
      lastName,
      email,
      birthYear,
      birthday,
      phone,
      favoriteTeam,
      parentId,
      socialMedia, // { instagram?: string, facebook?: string, twitter?: string, linkedin?: string }
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !birthYear || !birthday) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
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
        email,
        birthYear: parseInt(birthYear),
        birthday: new Date(birthday),
        phone: phone || null,
        favoriteTeam: favoriteTeam || null,
        parentId: parentId || null,
        password: hashedPassword,
        isAdmin: false,
        ...socialUrls,
      },
    })

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
    
    // Check if user is authenticated and is admin
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
        favoriteTeam: true,
        profilePhotoUrl: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching users' },
      { status: 500 }
    )
  }
}
