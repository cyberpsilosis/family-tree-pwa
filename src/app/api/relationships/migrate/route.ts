import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { migrateLegacyRelationship } from '@/lib/user-relationships'

// POST /api/relationships/migrate?userId=xxx - Migrate legacy relationship to new structure
export async function POST(request: NextRequest) {
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

    // Only allow users to migrate their own relationships, or admins to migrate any
    if (currentUser.userId !== userId && !currentUser.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await migrateLegacyRelationship(userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error migrating legacy relationship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
