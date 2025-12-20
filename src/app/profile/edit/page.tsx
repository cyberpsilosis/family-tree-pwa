import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EditProfileForm from '@/components/profile/EditProfileForm'

export default async function EditProfilePage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect('/')

  const user = await prisma.user.findUnique({
    where: { id: currentUser.userId },
  })

  if (!user) redirect('/')

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-light/20 via-background to-forest-dark/20">
      <EditProfileForm user={user} />
    </div>
  )
}
