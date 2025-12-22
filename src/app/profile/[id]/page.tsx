import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateRelationship } from '@/lib/relationships'
import ProfileView from '@/components/profile/ProfileView'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect('/')

  const { id } = await params

  const [member, allUsers, relationships] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    }),
    prisma.user.findMany(),
    prisma.userRelationship.findMany(),
  ])

  if (!member) {
    redirect('/home')
  }

  // Get the logged-in user's info
  const loggedInUser = allUsers.find(u => u.id === currentUser.userId)
  
  // Calculate relationship to current user with special logic for friends/partners
  let relationship: string
  
  // If viewing own profile
  if (member.id === currentUser.userId) {
    relationship = 'Self'
  }
  // If logged-in user is a friend, all others are 'Family'
  else if (loggedInUser?.friendId) {
    relationship = 'Family'
  }
  // If logged-in user is partner/married, all others are 'Family' (except their partner)
  else if (loggedInUser?.relationshipType === 'partner' || loggedInUser?.relationshipType === 'married') {
    // Check if viewing user is the partner
    const isPartner = relationships.some(
      rel => 
        (rel.userId === currentUser.userId && rel.relatedUserId === member.id) ||
        (rel.relatedUserId === currentUser.userId && rel.userId === member.id)
    )
    if (isPartner) {
      relationship = loggedInUser?.relationshipType === 'married' ? 'Spouse' : 'Partner'
    } else {
      relationship = 'Family'
    }
  }
  // If viewing user is a family friend
  else if (member.friendId) {
    relationship = 'Family Friend'
  }
  // Otherwise calculate actual family relationship
  else {
    relationship = calculateRelationship(currentUser.userId, member.id, allUsers)
  }

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
