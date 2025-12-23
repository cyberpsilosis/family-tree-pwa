import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateRelationship } from '@/lib/relationships'
import ProfileView from '@/components/profile/ProfileView'

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect('/')

  const { id } = await params

  // Optimized: Only fetch the member with their direct relationships
  const member = await prisma.user.findUnique({
    where: { id },
    include: {
      parent: {
        select: { id: true, firstName: true, lastName: true, profilePhotoUrl: true }
      },
      parent2: {
        select: { id: true, firstName: true, lastName: true, profilePhotoUrl: true }
      },
      children: {
        select: { id: true, firstName: true, lastName: true, profilePhotoUrl: true, birthday: true }
      },
    },
  })

  if (!member) {
    redirect('/home')
  }

  // Fetch only siblings if member has parents (more efficient than fetching all users)
  const siblings = member.parentId || member.parent2Id ? await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: member.id } },
        {
          OR: [
            member.parentId ? { parentId: member.parentId } : {},
            member.parentId ? { parent2Id: member.parentId } : {},
            member.parent2Id ? { parentId: member.parent2Id } : {},
            member.parent2Id ? { parent2Id: member.parent2Id } : {},
          ].filter(condition => Object.keys(condition).length > 0)
        }
      ]
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePhotoUrl: true,
      birthday: true,
    }
  }) : []

  // Fetch only relationships relevant to current user and viewed member
  const relationships = await prisma.userRelationship.findMany({
    where: {
      OR: [
        { userId: currentUser.userId },
        { relatedUserId: currentUser.userId },
        { userId: member.id },
        { relatedUserId: member.id },
      ]
    }
  })

  // Get the logged-in user's info (only if needed)
  const loggedInUser = member.id !== currentUser.userId ? await prisma.user.findUnique({
    where: { id: currentUser.userId },
    select: { id: true, friendId: true, parentId: true, parent2Id: true }
  }) : member
  
  // Calculate relationship to current user with special logic for friends/partners
  let relationship: string
  
  // If viewing own profile
  if (member.id === currentUser.userId) {
    relationship = 'Self'
  } else {
    // Check UserRelationship table for direct relationships
    const directRelationship = relationships.find(
      rel => 
        (rel.userId === currentUser.userId && rel.relatedUserId === member.id) ||
        (rel.relatedUserId === currentUser.userId && rel.userId === member.id)
    )
    
    if (directRelationship) {
      // Direct relationship exists
      if (directRelationship.relationshipType === 'married') {
        relationship = 'Spouse'
      } else if (directRelationship.relationshipType === 'partner') {
        relationship = 'Partner'
      } else if (directRelationship.relationshipType === 'friend') {
        relationship = 'Family Friend'
      } else {
        relationship = directRelationship.relationshipType
      }
    }
    // If logged-in user has any friend relationship, others are 'Family'
    else if (relationships.some(rel => 
      (rel.userId === currentUser.userId || rel.relatedUserId === currentUser.userId) &&
      rel.relationshipType === 'friend'
    )) {
      relationship = 'Family'
    }
    // If logged-in user is partner/married, all others are 'Family'
    else if (relationships.some(rel => 
      (rel.userId === currentUser.userId || rel.relatedUserId === currentUser.userId) &&
      (rel.relationshipType === 'partner' || rel.relationshipType === 'married')
    )) {
      relationship = 'Family'
    }
    // Check legacy friendId field for backward compatibility
    else if (loggedInUser?.friendId || member.friendId) {
      relationship = member.friendId ? 'Family Friend' : 'Family'
    }
    // Otherwise calculate actual family relationship
    else {
      // Only fetch all users if we need to calculate complex family relationships
      // This is a fallback for cases where simple checks didn't work
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          parentId: true,
          parent2Id: true,
          friendId: true,
        }
      })
      relationship = calculateRelationship(currentUser.userId, member.id, allUsers, relationships)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-light/20 via-background to-forest-dark/20">
      <ProfileView 
        member={member} 
        relationship={relationship}
        currentUserId={currentUser.userId}
        siblings={siblings}
      />
    </div>
  )
}
