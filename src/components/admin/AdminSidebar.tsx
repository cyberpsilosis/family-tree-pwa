'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Mail, UserPlus, Users, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '../auth/ThemeToggle'
import { getLogoIconPath } from '@/lib/logo-utils'
import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Add Member', href: '/admin/create-profile', icon: UserPlus },
  { name: 'Members', href: '/admin/members', icon: Users },
]

export function AdminHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-card/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center group-hover:opacity-80 transition-opacity">
                <Image
                  src={getLogoIconPath(192)}
                  alt="Family Tree Logo"
                  width={36}
                  height={36}
                />
              </div>
              <span className="hidden font-semibold text-lg tracking-tight sm:inline-block">Family Tree</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-mono text-xs uppercase tracking-wider">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-8 flex-shrink-0">
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 whitespace-nowrap flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">Logout</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden hover:bg-primary/10 p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background md:hidden animate-fade-in">
          <div className="relative flex h-full flex-col">
            {/* Mobile Menu Header */}
            <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
              <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center">
                  <Image
                    src={getLogoIconPath(192)}
                    alt="Family Tree Logo"
                    width={32}
                    height={32}
                  />
                </div>
                <span className="font-semibold tracking-tight">Family Tree</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="hover:bg-primary/10 h-9 w-9 rounded-lg flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 flex flex-col justify-between px-4 py-4">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Actions */}
              <div>
                <div className="h-px bg-border/50 my-3" />
                <div className="flex items-center justify-between mb-3 px-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
