import type React from "react"
import { Header } from "./header"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  )
}
