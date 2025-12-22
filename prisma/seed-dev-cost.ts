import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial development cost...')

  // Check if any dev cost items exist
  const existingItems = await prisma.developmentCostItem.findMany()

  if (existingItems.length === 0) {
    // Add initial $200 development software cost
    const initialCost = await prisma.developmentCostItem.create({
      data: {
        description: 'Initial development software costs',
        amount: 200,
        addedBy: 'system',
      },
    })

    console.log('✓ Created initial development cost item:', initialCost)
  } else {
    console.log('✓ Development cost items already exist, skipping seed')
  }
}

main()
  .catch((e) => {
    console.error('Error seeding development cost:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
