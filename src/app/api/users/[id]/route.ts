import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generatePassword, hashPassword } from '@/lib/password'
import { sendPasswordResetEmail } from '@/lib/email'
import { fromDateInputValue } from '@/lib/date'
import { apiCache } from '@/lib/cache'

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
        customCardText: true,
        jobTitle: true,
        occupation: true,
        preferredContactMethod: true,
        instagram: true,
        facebook: true,
        twitter: true,
        linkedin: true,
        profilePhotoUrl: true,
        address: true,
        shippingAddress: true,
        parentId: true,
        parent2Id: true,
        friendId: true,
        relationshipType: true,
        isAdmin: true,
        isDeceased: true,
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
      shippingAddress,
      favoriteTeam,
      customCardText,
      jobTitle,
      occupation,
      preferredContactMethod,
      parentId,
      parent2Id,
      friendId,
      relationshipType,
      profilePhotoUrl,
      socialMedia,
      isDeceased,
      regeneratePassword,
      instagram,
      facebook,
      twitter,
      linkedin,
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
      shippingAddress: shippingAddress !== undefined ? (shippingAddress || null) : undefined,
      favoriteTeam: favoriteTeam || null,
      customCardText: customCardText || null,
      jobTitle: jobTitle || null,
      occupation: occupation || null,
      preferredContactMethod: preferredContactMethod || null,
    }

    // Only include these fields if they're provided (for admin edits)
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (birthYear !== undefined) updateData.birthYear = birthYear
    if (birthday !== undefined) updateData.birthday = fromDateInputValue(birthday)
    if (parentId !== undefined) updateData.parentId = parentId || null
    if (parent2Id !== undefined) updateData.parent2Id = parent2Id || null
    if (friendId !== undefined) updateData.friendId = friendId || null
    if (relationshipType !== undefined) updateData.relationshipType = relationshipType || null
    if (isDeceased !== undefined) updateData.isDeceased = isDeceased
    if (profilePhotoUrl !== undefined) updateData.profilePhotoUrl = profilePhotoUrl || null

    // Handle social media - can be full URLs or handles
    if (instagram !== undefined) updateData.instagram = instagram
    if (facebook !== undefined) updateData.facebook = facebook
    if (twitter !== undefined) updateData.twitter = twitter
    if (linkedin !== undefined) updateData.linkedin = linkedin
    
    // Also handle socialMedia object (for admin forms that send handles)
    if (socialMedia) {
      if (socialMedia.instagram !== undefined) {
        updateData.instagram = socialMedia.instagram && !socialMedia.instagram.startsWith('http')
          ? `https://instagram.com/${socialMedia.instagram}`
          : socialMedia.instagram
      }
      if (socialMedia.facebook !== undefined) {
        updateData.facebook = socialMedia.facebook && !socialMedia.facebook.startsWith('http')
          ? `https://facebook.com/${socialMedia.facebook}`
          : socialMedia.facebook
      }
      if (socialMedia.twitter !== undefined) {
        updateData.twitter = socialMedia.twitter && !socialMedia.twitter.startsWith('http')
          ? `https://x.com/${socialMedia.twitter}`
          : socialMedia.twitter
      }
      if (socialMedia.linkedin !== undefined) {
        updateData.linkedin = socialMedia.linkedin && !socialMedia.linkedin.startsWith('http')
          ? `https://www.linkedin.com/in/${socialMedia.linkedin}`
          : socialMedia.linkedin
      }
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
        customCardText: true,
        jobTitle: true,
        occupation: true,
        preferredContactMethod: true,
        instagram: true,
        facebook: true,
        twitter: true,
        linkedin: true,
      },
    })

    // Invalidate users cache after updating
    apiCache.invalidatePattern('users-')

    // Send email if password was regenerated
    if (regeneratePassword && newPassword) {
      await sendPasswordResetEmail({
        to: email,
        firstName: firstName || existingUser.firstName,
        newPassword,
      })
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

    // Invalidate users cache after deleting
    apiCache.invalidatePattern('users-')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
