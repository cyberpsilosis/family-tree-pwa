import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: Fetch current development cost status
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the first (and only) development cost record, or create one if it doesn't exist
    let devCost = await prisma.developmentCost.findFirst()
    
    if (!devCost) {
      devCost = await prisma.developmentCost.create({
        data: {
          currentAmount: 0,
          goalAmount: 5000,
        },
      })
    }

    return NextResponse.json(devCost)
  } catch (error) {
    console.error('Error fetching development cost:', error)
    return NextResponse.json(
      { error: 'Failed to fetch development cost' },
      { status: 500 }
    )
  }
}

// PATCH: Update development cost
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentAmount, goalAmount, description } = body

    // Validation
    if (currentAmount !== undefined && (typeof currentAmount !== 'number' || currentAmount < 0)) {
      return NextResponse.json(
        { error: 'Current amount must be a positive number' },
        { status: 400 }
      )
    }

    if (goalAmount !== undefined && (typeof goalAmount !== 'number' || goalAmount <= 0)) {
      return NextResponse.json(
        { error: 'Goal amount must be a positive number' },
        { status: 400 }
      )
    }

    // Get or create the development cost record
    let devCost = await prisma.developmentCost.findFirst()
    
    if (!devCost) {
      devCost = await prisma.developmentCost.create({
        data: {
          currentAmount: currentAmount ?? 0,
          goalAmount: goalAmount ?? 5000,
          description: description ?? null,
          updatedBy: user.email,
        },
      })
    } else {
      devCost = await prisma.developmentCost.update({
        where: { id: devCost.id },
        data: {
          ...(currentAmount !== undefined && { currentAmount }),
          ...(goalAmount !== undefined && { goalAmount }),
          ...(description !== undefined && { description }),
          updatedBy: user.email,
        },
      })
    }

    return NextResponse.json(devCost)
  } catch (error) {
    console.error('Error updating development cost:', error)
    return NextResponse.json(
      { error: 'Failed to update development cost' },
      { status: 500 }
    )
  }
}
