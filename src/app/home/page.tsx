import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function MemberHome() {
  const user = await getCurrentUser()
  
  // Redirect to login if not authenticated
  if (!user) {
    redirect('/')
  }

  // Get full user data from database
  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  })

  if (!userData) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-light/20 to-forest/30 p-8">
      <div className="glass-card max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-forest-text mb-4">
          Member Home
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Welcome to your family portal
        </p>
        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-6 backdrop-blur-sm border border-forest-light/30">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Logged in as:
          </p>
          <p className="text-xl font-semibold text-forest-text">
            {userData.firstName} {userData.lastName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {userData.email}
          </p>
        </div>
      </div>
    </div>
  )
}
