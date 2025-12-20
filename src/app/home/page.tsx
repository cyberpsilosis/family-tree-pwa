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

  // Get all users for the directory
  const usersRaw = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      birthday: true,
      birthYear: true,
      favoriteTeam: true,
      instagram: true,
      facebook: true,
      twitter: true,
      linkedin: true,
      profilePhotoUrl: true,
      isAdmin: true,
      parentId: true,
    },
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  })

  // Convert Date to ISO string for client components
  const users = usersRaw.map(user => ({
    ...user,
    birthday: user.birthday.toISOString(),
  }))

  return <MemberHomeClient users={users} currentUserId={user.userId} />
}
