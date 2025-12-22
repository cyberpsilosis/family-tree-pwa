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
        parent2: true,
        children: true,
      },
    }),
    prisma.user.findMany(),
    prisma.userRelationship.findMany(),
  ])

  if (!member) {
    redirect('/home')
  }

  // Get siblings (users who share at least one parent with this member)
  const siblings = allUsers.filter(u => 
    u.id !== member.id && // Not the member themselves
    (
      (member.parentId && u.parentId === member.parentId) || // Same parent
      (member.parent2Id && u.parent2Id === member.parent2Id) || // Same parent2
      (member.parentId && u.parent2Id === member.parentId) || // Member's parent is their parent2
      (member.parent2Id && u.parentId === member.parent2Id) // Member's parent2 is their parent
    )
  )

  // Get the logged-in user's info
  const loggedInUser = allUsers.find(u => u.id === currentUser.userId)
  
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
