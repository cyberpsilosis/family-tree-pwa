"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, Users, Calendar, FileText, Bot, LogOut, Settings, Moon, Sun } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "People", href: "/people", icon: Users },
  { name: "Meetings", href: "/meetings", icon: Calendar },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Board Agent", href: "/agent", icon: Bot },
]

function getCurrentPage(pathname: string) {
  // Check navigation items first
  for (const item of navigation) {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      return { name: item.name, icon: item.icon }
    }
  }
  // Check for admin
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return { name: "Admin", icon: Settings }
  }
  return null
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  const currentPage = getCurrentPage(pathname)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-card/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 group-hover:border-primary/50 transition-colors">
                <span className="font-mono text-sm font-semibold text-primary">BP</span>
              </div>
              <span className="hidden font-semibold text-lg tracking-tight sm:inline-block">Board Portal</span>
            </Link>

            {currentPage && (
              <div className="flex items-center gap-2 md:hidden">
                <span className="text-muted-foreground/50">/</span>
                <div className="flex items-center gap-1.5 text-foreground">
                  <currentPage.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{currentPage.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation - refined spacing and hover states */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-mono text-xs uppercase tracking-wider">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-1 ring-border hover:ring-primary/50 transition-all"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/professional-headshot.png" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-mono text-sm">
                      JD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex flex-col">
                    <p className="font-semibold">Jane Doe</p>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Board Chair</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive-foreground cursor-pointer"
                  onSelect={() => setSignOutDialogOpen(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Hamburger - Right Side */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-primary/10"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background md:hidden animate-fade-in">
          {/* Atmospheric background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative flex h-full flex-col">
            {/* Mobile Menu Header */}
            <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
              <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                  <span className="font-mono text-xs font-semibold text-primary">BP</span>
                </div>
                <span className="font-semibold tracking-tight">Board Portal</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="hover:bg-primary/10 h-9 w-9"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Unified navigation area - everything flows together */}
            <div className="flex-1 flex flex-col justify-between px-4 py-4">
              {/* Main Navigation */}
              <nav className="space-y-1">
                {navigation.map((item, index) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 animate-slide-in-right",
                        `stagger-${index + 1}`,
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* User section - integrated with nav, compact design */}
              <div className="animate-fade-up stagger-6">
                {/* Divider with subtle styling */}
                <div className="h-px bg-border/50 my-3" />

                {/* User info row - compact inline design */}
                <div className="flex items-center gap-3 px-4 py-2 mb-1">
                  <Avatar className="h-10 w-10 ring-1 ring-primary/20">
                    <AvatarImage src="/professional-headshot.png" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-mono text-sm">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">Jane Doe</p>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Board Chair</p>
                  </div>
                  <button
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="flex items-center justify-center h-9 w-9 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    aria-label="Toggle theme"
                  >
                    {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </button>
                </div>

                {/* Admin and Sign out - compact row */}
                <div className="flex gap-2">
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground bg-secondary/30 hover:bg-secondary/50 hover:text-foreground transition-all"
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setSignOutDialogOpen(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-destructive-foreground bg-destructive/5 hover:bg-destructive/10 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign out dialog explaining auth is not yet integrated */}
      <Dialog open={signOutDialogOpen} onOpenChange={setSignOutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Not Configured</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              Admin functionality including authentication is stubbed out for illustrative purposes but has not yet been
              integrated with a functioning authentication system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSignOutDialogOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
