import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MemberHomeClient } from '@/components/member/MemberHomeClient'

// Disable caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MemberHome() {
  const user = await getCurrentUser()
  
  // Redirect to login if not authenticated
  if (!user) {
    redirect('/')
  }

  // Get all users and relationships in parallel
  const [usersRaw, relationshipsRaw] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        customCardText: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        birthday: true,
        birthYear: true,
        favoriteTeam: true,
        jobTitle: true,
        occupation: true,
        instagram: true,
        facebook: true,
        twitter: true,
        linkedin: true,
        profilePhotoUrl: true,
        isAdmin: true,
        parentId: true,
        parent2Id: true,
        friendId: true,
        relationshipType: true,
        preferredContactMethod: true,
        isDeceased: true,
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    }),
    prisma.userRelationship.findMany({
      select: {
        id: true,
        userId: true,
        relatedUserId: true,
        relationshipType: true,
        isPrimary: true,
      }
    })
  ])

  // Convert Date to ISO string for client components
  const users = usersRaw.map(user => ({
    ...user,
    birthday: user.birthday.toISOString(),
  }))

  // Cast relationships to proper type
  const relationships = relationshipsRaw.map(rel => ({
    ...rel,
    relationshipType: rel.relationshipType as 'friend' | 'partner' | 'married'
  }))

  return <MemberHomeClient users={users} relationships={relationships} currentUserId={user.userId} />
}
