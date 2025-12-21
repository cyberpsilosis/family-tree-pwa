import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Redirect to admin login if not authenticated
  if (!user) {
    redirect('/admin-login')
  }

  // Redirect to home if authenticated but not admin
  if (!user.isAdmin) {
    redirect('/home')
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="pt-16">
        <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  )
}
