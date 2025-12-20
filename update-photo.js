const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.user.update({
    where: {
      email: 'gitagoddess@gmail.com'
    },
    data: {
      profilePhotoUrl: 'https://res.cloudinary.com/du2kxuuce/image/upload/v1766231300/family-tree/profile-photos/qatbxgdrirv2xpl3i6tw.jpg'
    }
  })
  
  console.log('Updated user:', result.firstName, result.lastName)
  console.log('Profile photo URL:', result.profilePhotoUrl)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
