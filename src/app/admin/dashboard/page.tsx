import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Mail, UserPlus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const quickStats = [
  { label: 'Total Members', value: '0', icon: Users, href: '/admin/members', linkText: 'View all' },
  { label: 'Added This Month', value: '0', icon: UserPlus, href: '/admin/create-profile', linkText: 'Add member' },
]

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  // Auth check is handled by layout.tsx

  return (
    <div className="relative mx-auto max-w-7xl space-y-10">
      {/* Atmospheric background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-60 w-60 rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Welcome Section */}
      <div className="relative animate-fade-up stagger-1">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Dashboard</p>
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground md:text-5xl">
          Welcome back, <span className="font-semibold">Administrator</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">Manage your family tree</p>
      </div>

      {/* Quick Stats */}
      <div className="relative grid gap-4 sm:grid-cols-2 animate-fade-up stagger-2">
        {quickStats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="block">
            <Card className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 h-full">
              <CardContent className="flex flex-col p-6 h-full">
                <div className="flex items-center gap-5 flex-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-colors">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-light text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide leading-none">{stat.label}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-3 border-t border-border/30">
                  <span className="font-mono text-xs uppercase tracking-wide text-primary group-hover:text-primary/80 transition-colors flex items-center gap-1">
                    {stat.linkText}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Admin Info Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-up stagger-3">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
              <span className="font-mono text-lg font-semibold text-primary">A</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide">Logged in as</p>
              <p className="text-lg font-medium text-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
