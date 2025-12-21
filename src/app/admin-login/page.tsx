import { LoginForm } from '@/components/auth/LoginForm'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLoginPage() {
  // If already logged in as admin, redirect to dashboard
  const user = await getCurrentUser()
  if (user?.isAdmin) {
    redirect('/admin/dashboard')
  }

  return <LoginForm mode="admin" />
}
