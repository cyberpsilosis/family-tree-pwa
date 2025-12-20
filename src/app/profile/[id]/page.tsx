import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateRelationship } from '@/lib/relationships'
import ProfileView from '@/components/profile/ProfileView'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect('/')

  const { id } = await params

  const [member, allUsers] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    }),
    prisma.user.findMany(),
  ])

  if (!member) {
    redirect('/home')
  }

  // Calculate relationship to current user
  const relationship = calculateRelationship(currentUser.userId, member.id, allUsers)

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-light/20 via-background to-forest-dark/20">
      <ProfileView 
        member={member} 
        relationship={relationship}
        currentUserId={currentUser.userId}
      />
    </div>
  )
}
