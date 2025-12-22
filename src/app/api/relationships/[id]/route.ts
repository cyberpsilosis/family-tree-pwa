import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { removeUserRelationship } from '@/lib/user-relationships'
import { prisma } from '@/lib/prisma'

// DELETE /api/relationships/[id] - Remove a relationship
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the relationship to verify ownership
    const relationship = await prisma.userRelationship.findUnique({
      where: { id }
    })

    if (!relationship) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 })
    }

    // Only allow users to remove their own relationships, or admins
    if (relationship.userId !== currentUser.userId && !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await removeUserRelationship(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing relationship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
