import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBirthdays() {
  console.log('Starting birthday fix...')
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthday: true,
    },
  })

  console.log(`Found ${users.length} users to check`)

  for (const user of users) {
    // Add one day to the birthday to compensate for timezone shift
    const currentBirthday = new Date(user.birthday)
    const fixedBirthday = new Date(currentBirthday)
    fixedBirthday.setDate(fixedBirthday.getDate() + 1)
    
    console.log(`${user.firstName} ${user.lastName}: ${currentBirthday.toISOString()} -> ${fixedBirthday.toISOString()}`)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { birthday: fixedBirthday },
    })
  }

  console.log('Birthday fix complete!')
  await prisma.$disconnect()
}

fixBirthdays().catch(console.error)
