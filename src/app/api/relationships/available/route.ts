import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUsersInRomanticRelationships } from '@/lib/user-relationships'

// GET /api/relationships/available - Get users available for romantic relationships
export async function GET(request: NextRequest) {
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
