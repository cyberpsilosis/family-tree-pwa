import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { addUserRelationship, getUserRelationships, getUsersInRomanticRelationships } from '@/lib/user-relationships'

// GET /api/relationships?userId=xxx - Get all relationships for a user
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Only allow users to view their own relationships, or admins to view any
    if (currentUser.userId !== userId && !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const relationships = await getUserRelationships(userId)
    return NextResponse.json(relationships)
  } catch (error) {
    console.error('Error fetching relationships:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/relationships - Add a new relationship
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, relatedUserId, relationshipType } = body

    if (!userId || !relatedUserId || !relationshipType) {
      return NextResponse.json(
        { error: 'userId, relatedUserId, and relationshipType required' },
        { status: 400 }
      )
    }

    // Only allow users to add their own relationships, or admins to add any
    if (currentUser.userId !== userId && !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate relationship type
    if (!['friend', 'partner', 'married'].includes(relationshipType)) {
      return NextResponse.json(
        { error: 'Invalid relationship type' },
        { status: 400 }
      )
    }

    const result = await addUserRelationship(userId, relatedUserId, relationshipType)
    
    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('Error adding relationship:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('already in a romantic') ? 400 : 500 }
    )
  }
}

// GET /api/relationships/available - Get users available for romantic relationships
export async function GET_AVAILABLE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usersInRelationships = await getUsersInRomanticRelationships()
    
    return NextResponse.json({
      unavailableUserIds: usersInRelationships
    })
  } catch (error) {
    console.error('Error fetching available users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
