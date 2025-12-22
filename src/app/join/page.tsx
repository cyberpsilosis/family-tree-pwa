'use client'

import { useState } from 'react'
import { JoinForm } from '@/components/auth/JoinForm'
import { LoginForm } from '@/components/auth/LoginForm'

export default function JoinPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Show login screen first, then show form once authenticated
  if (!isAuthenticated) {
    return <LoginForm mode="join" onJoinAuthenticated={() => setIsAuthenticated(true)} />
  }

  return <JoinForm />
}
