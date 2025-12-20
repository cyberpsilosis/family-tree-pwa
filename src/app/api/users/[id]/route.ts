import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generatePassword, hashPassword } from '@/lib/password'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// GET /api/users/[id] - Fetch single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthYear: true,
        birthday: true,
        phone: true,
        favoriteTeam: true,
        instagram: true,
        facebook: true,
        twitter: true,
        linkedin: true,
        profilePhotoUrl: true,
        address: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Allow users to edit their own profile, or admins to edit any profile
    if (currentUser.userId !== id && !currentUser.isAdmin) {
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
      parentId,
      profilePhotoUrl,
      socialMedia,
      regeneratePassword,
    } = body

    // Fetch existing user to check for password regeneration
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { firstName: true, lastName: true, birthYear: true, email: true },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update data
    const updateData: any = {
      email,
      phone: phone || null,
      address: address || null,
      favoriteTeam: favoriteTeam || null,
    }

    // Only include these fields if they're provided (for admin edits)
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (birthYear !== undefined) updateData.birthYear = birthYear
    if (birthday !== undefined) updateData.birthday = new Date(birthday)
    if (parentId !== undefined) updateData.parentId = parentId || null
    if (profilePhotoUrl !== undefined) updateData.profilePhotoUrl = profilePhotoUrl || null

    // Handle social media URLs
    if (socialMedia) {
      updateData.instagram = socialMedia.instagram
        ? `https://instagram.com/${socialMedia.instagram}`
        : null
      updateData.facebook = socialMedia.facebook
        ? `https://facebook.com/${socialMedia.facebook}`
        : null
      updateData.twitter = socialMedia.twitter
        ? `https://x.com/${socialMedia.twitter}`
        : null
      updateData.linkedin = socialMedia.linkedin
        ? `https://www.linkedin.com/in/${socialMedia.linkedin}`
        : null
    }

    // Handle password regeneration
    let newPassword: string | null = null
    if (regeneratePassword) {
      newPassword = generatePassword(firstName, lastName, birthYear)
      const hashedPassword = await hashPassword(newPassword)
      updateData.password = hashedPassword
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthYear: true,
        birthday: true,
        phone: true,
        favoriteTeam: true,
        instagram: true,
        facebook: true,
        twitter: true,
        linkedin: true,
      },
    })

    // Send email if password was regenerated
    if (regeneratePassword && newPassword) {
      try {
        await resend.emails.send({
          from: 'Family Tree <onboarding@resend.dev>',
          to: email,
          subject: 'Your Family Tree password has been updated',
          html: `
            <h2>Password Updated</h2>
            <p>Hello ${firstName},</p>
            <p>Your profile details have been updated, and your password has been regenerated.</p>
            <p><strong>Your new password is:</strong> <code style="background: #f4f4f4; padding: 4px 8px; border-radius: 4px;">${newPassword}</code></p>
            <p>Please use this password to log in to the Family Tree app:</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}</a></p>
            <hr />
            <p style="color: #666; font-size: 12px;">To install the app on your mobile device, open this link in your mobile browser and tap "Add to Home Screen".</p>
          `,
        })
      } catch (emailError) {
        console.error('Error sending password regeneration email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      user: updatedUser,
      passwordRegenerated: regeneratePassword,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
