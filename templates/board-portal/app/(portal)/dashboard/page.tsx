import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Users, Bot, ArrowRight } from "lucide-react"
import Link from "next/link"

const upcomingMeeting = {
  title: "Q4 Board Meeting",
  date: "December 15, 2025",
  time: "9:00 AM EST",
  type: "Board Meeting",
}

const recentDocuments = [
  { title: "Q3 Financial Report", category: "Financials", date: "Nov 20, 2025" },
  { title: "Strategic Plan 2026", category: "Strategy", date: "Nov 15, 2025" },
  { title: "Risk Assessment Update", category: "Governance", date: "Nov 10, 2025" },
]

const quickStats = [
  { label: "Board Members", value: "9", icon: Users, href: "/people", linkText: "Launch directory" },
  { label: "Upcoming Meetings", value: "2", icon: Calendar, href: "/meetings", linkText: "View calendar" },
  { label: "Recent Documents", value: "12", icon: FileText, href: "/documents", linkText: "Browse docs" },
]

export default function DashboardPage() {
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
        <h1 className="text-4xl font-light tracking-tight md:text-5xl">
          Welcome back, <span className="font-semibold text-primary">Jane</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">Here's what's happening with your board</p>
      </div>

      {/* Quick Stats - enhanced cards */}
      <div className="relative grid gap-4 sm:grid-cols-3 animate-fade-up stagger-2">
        {quickStats.map((stat, index) => (
          <Link key={stat.label} href={stat.href} className="block">
            <Card className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 h-full">
              <CardContent className="flex flex-col p-6 h-full">
                <div className="flex items-center gap-5 flex-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-colors">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-light">{stat.value}</p>
                    <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide">{stat.label}</p>
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

      <div className="relative grid gap-6 lg:grid-cols-2">
        {/* Next Meeting - enhanced styling */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-up stagger-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-medium">Next Meeting</CardTitle>
              <CardDescription className="font-mono text-xs uppercase tracking-wide">
                Your upcoming board meeting
              </CardDescription>
            </div>
            <Link
              href="/meetings"
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group"
            >
              <span className="font-mono text-xs uppercase tracking-wide">View all</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{upcomingMeeting.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    <span className="font-mono text-sm">{upcomingMeeting.date}</span>
                    <span className="mx-2 text-border">|</span>
                    <span className="font-mono text-sm">{upcomingMeeting.time}</span>
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wide bg-secondary/80">
                  {upcomingMeeting.type}
                </Badge>
              </div>
              <div className="mt-5 flex gap-4">
                <Link
                  href="/meetings/1"
                  className="font-mono text-xs uppercase tracking-wide text-primary hover:text-primary/80 transition-colors"
                >
                  View agenda
                </Link>
                <span className="text-border">|</span>
                <Link
                  href="/documents?meeting=1"
                  className="font-mono text-xs uppercase tracking-wide text-primary hover:text-primary/80 transition-colors"
                >
                  Board packet
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents - enhanced cards */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-up stagger-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-medium">Recent Documents</CardTitle>
              <CardDescription className="font-mono text-xs uppercase tracking-wide">
                Latest materials added
              </CardDescription>
            </div>
            <Link
              href="/documents"
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group"
            >
              <span className="font-mono text-xs uppercase tracking-wide">View all</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.map((doc, index) => (
                <div
                  key={doc.title}
                  className="group flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-4 hover:border-primary/30 hover:bg-secondary/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{doc.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{doc.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs uppercase tracking-wide">
                    {doc.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Board Agent CTA - premium styling */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-primary/30 animate-fade-up stagger-5">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Icon and text group */}
            <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-medium">Board Agent</h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
                  Get AI-powered assistance for your board work
                </p>
              </div>
            </div>
            {/* CTA button */}
            <Link
              href="/agent"
              className="inline-flex items-center justify-center gap-2 sm:gap-3 rounded-xl bg-primary px-5 sm:px-6 py-3 font-mono text-xs sm:text-sm uppercase tracking-wide text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto shrink-0"
            >
              Start conversation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
