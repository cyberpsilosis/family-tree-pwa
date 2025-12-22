import { prisma } from './prisma'

/**
 * Add a relationship between two users
 * Automatically determines if this is a primary connection
 */
export async function addUserRelationship(
  userId: string,
  relatedUserId: string,
  relationshipType: 'friend' | 'partner' | 'married'
): Promise<{ isPrimary: boolean; relationshipId: string }> {
  // Check if this person is already connected to someone else with this relationship
  const existingRelationships = await prisma.userRelationship.findMany({
    where: {
      OR: [
        { userId: relatedUserId },
        { relatedUserId: relatedUserId }
      ]
    }
  })

  // Check if anyone has already connected to this person
  const isPrimary = !existingRelationships.some(rel => 
    (rel.userId === relatedUserId || rel.relatedUserId === relatedUserId) &&
    rel.isPrimary
  )

  // For romantic relationships (partner/married), verify exclusivity
  if (relationshipType === 'partner' || relationshipType === 'married') {
    const hasRomanticRelationship = existingRelationships.some(rel =>
      (rel.relationshipType === 'partner' || rel.relationshipType === 'married')
    )

    if (hasRomanticRelationship) {
      throw new Error('This person is already in a romantic relationship')
    }
  }

  // Create the relationship
  const relationship = await prisma.userRelationship.create({
    data: {
      userId,
      relatedUserId,
      relationshipType,
      isPrimary,
    }
  })

  return {
    isPrimary,
    relationshipId: relationship.id
  }
}

/**
 * Get all relationships for a user
 */
export async function getUserRelationships(userId: string) {
  const relationships = await prisma.userRelationship.findMany({
    where: {
      OR: [
        { userId },
        { relatedUserId: userId }
      ]
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhotoUrl: true,
        }
      },
      relatedUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhotoUrl: true,
        }
      }
    }
  })

  return relationships
}

/**
 * Remove a relationship
 */
export async function removeUserRelationship(relationshipId: string) {
  await prisma.userRelationship.delete({
    where: { id: relationshipId }
  })
}

/**
 * Get all users who are already in romantic relationships (for filtering)
 */
export async function getUsersInRomanticRelationships(): Promise<string[]> {
  const relationships = await prisma.userRelationship.findMany({
    where: {
      relationshipType: {
        in: ['partner', 'married']
      }
    },
    select: {
      userId: true,
      relatedUserId: true,
    }
  })

  const userIds = new Set<string>()
  relationships.forEach(rel => {
    userIds.add(rel.userId)
    userIds.add(rel.relatedUserId)
  })

  return Array.from(userIds)
}

/**
 * Migrate legacy single friend relationship to new many-to-many structure
 */
export async function migrateLegacyRelationship(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      friendId: true,
      relationshipType: true,
    }
  })

  if (user?.friendId && user?.relationshipType) {
    // Check if this relationship already exists in new structure
    const existing = await prisma.userRelationship.findFirst({
      where: {
        userId,
        relatedUserId: user.friendId,
        relationshipType: user.relationshipType
      }
    })

    if (!existing) {
      await addUserRelationship(userId, user.friendId, user.relationshipType as any)
    }
  }
}
