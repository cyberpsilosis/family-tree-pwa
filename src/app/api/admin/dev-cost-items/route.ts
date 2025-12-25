import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET: Fetch all development cost items (or just total for non-admin)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    const totalOnly = searchParams.get('totalOnly') === 'true'
    
    // Calculate total cost (public)
    const items = await prisma.developmentCostItem.findMany({
      orderBy: { createdAt: 'desc' }
    })
    const totalCost = items.reduce((sum, item) => sum + item.amount, 0)
    
    // If requesting total only, return it without auth check
    if (totalOnly) {
      return NextResponse.json({ totalCost })
    }
    
    // For full item details, require admin
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ items, totalCost })
  } catch (error) {
    console.error('Error fetching development cost items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch development cost items' },
      { status: 500 }
    )
  }
}

// POST: Add a new development cost item
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { description, amount } = body

    // Validation
    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    const item = await prisma.developmentCostItem.create({
      data: {
        description: description.trim(),
        amount,
        addedBy: user.email,
      },
    })

    // Calculate new total
    const allItems = await prisma.developmentCostItem.findMany()
    const totalCost = allItems.reduce((sum, item) => sum + item.amount, 0)

    return NextResponse.json({ item, totalCost })
  } catch (error) {
    console.error('Error adding development cost item:', error)
    return NextResponse.json(
      { error: 'Failed to add development cost item' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a development cost item
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    await prisma.developmentCostItem.delete({
      where: { id }
    })

    // Calculate new total
    const allItems = await prisma.developmentCostItem.findMany()
    const totalCost = allItems.reduce((sum, item) => sum + item.amount, 0)

    return NextResponse.json({ success: true, totalCost })
  } catch (error) {
    console.error('Error deleting development cost item:', error)
    return NextResponse.json(
      { error: 'Failed to delete development cost item' },
      { status: 500 }
    )
  }
}
