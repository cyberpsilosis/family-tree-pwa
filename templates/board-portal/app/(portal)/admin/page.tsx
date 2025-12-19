"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const adminSections = [
  {
    title: "People Management",
    description: "Add, edit, or archive board members and observers",
    icon: Users,
    href: "/admin/people",
    count: 6,
  },
  {
    title: "Meeting Management",
    description: "Create and manage board and committee meetings",
    icon: Calendar,
    href: "/admin/meetings",
    count: 4,
  },
  {
    title: "Document Management",
    description: "Add and organize board documents",
    icon: FileText,
    href: "/admin/documents",
    count: 8,
  },
]

export default function AdminPage() {
  const { toast } = useToast()

  const handleComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} will be available in a future update.`,
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Admin</h1>
          <Badge variant="secondary">Board Liaison</Badge>
        </div>
        <p className="mt-1 text-muted-foreground">Manage board portal content and settings</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => (
          <Card key={section.title} className="bg-card h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline">{section.count} items</Badge>
              </div>
              <CardTitle className="mt-4 text-lg">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Admin features coming soon</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
