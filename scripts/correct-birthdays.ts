import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function correctBirthdays() {
  console.log('Correcting birthdays (subtracting 1 day)...')
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthday: true,
    },
  })

  console.log(`Found ${users.length} users to correct`)

  for (const user of users) {
    // Subtract one day from the birthday
    const currentBirthday = new Date(user.birthday)
    const correctedBirthday = new Date(currentBirthday)
    correctedBirthday.setDate(correctedBirthday.getDate() - 1)
    
    console.log(`${user.firstName} ${user.lastName}: ${currentBirthday.toISOString().split('T')[0]} -> ${correctedBirthday.toISOString().split('T')[0]}`)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { birthday: correctedBirthday },
    })
  }

  console.log('Birthday correction complete!')
  await prisma.$disconnect()
}

correctBirthdays().catch(console.error)
