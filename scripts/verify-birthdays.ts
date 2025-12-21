import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyBirthdays() {
  const users = await prisma.user.findMany({
    select: {
      firstName: true,
      lastName: true,
      birthday: true,
    },
  })

  console.log('Current birthdays in database:')
  users.forEach(u => {
    console.log(`${u.firstName} ${u.lastName}: ${u.birthday.toISOString().split('T')[0]}`)
  })

  await prisma.$disconnect()
}

verifyBirthdays().catch(console.error)
