import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Video, FileText, ExternalLink, ArrowLeft, ListChecks } from "lucide-react"
import { meetings, getMeetingById } from "@/lib/data/meetings"

export function generateStaticParams() {
  return meetings.map((meeting) => ({
    id: meeting.id,
  }))
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const meeting = getMeetingById(id)

  if (!meeting) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/meetings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Meetings
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{meeting.title}</h1>
          <Badge variant={meeting.status === "upcoming" ? "default" : "secondary"}>
            {meeting.status === "upcoming" ? "Upcoming" : "Past"}
          </Badge>
        </div>
        <Badge variant={meeting.type === "Board Meeting" ? "default" : "outline"}>{meeting.type}</Badge>
      </div>

      {/* Meeting details card */}
      <Card className="bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(meeting.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{meeting.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                {meeting.isVirtual ? (
                  <Video className="h-5 w-5 text-primary" />
                ) : (
                  <MapPin className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                {meeting.isVirtual ? (
                  <a
                    href={meeting.virtualLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Join Zoom Meeting
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="font-medium">{meeting.location}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-muted-foreground">{meeting.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Agenda */}
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Agenda</h2>
          </div>
          <div className="space-y-3">
            {meeting.agenda.map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <span className="text-sm font-mono text-muted-foreground w-20 shrink-0">{item.time}</span>
                <span className="text-sm">{item.item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Meeting Documents</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {meeting.documents.map((doc) => {
              const href =
                doc.type === "board-packet"
                  ? `/documents?filter=Board Books&meeting=${encodeURIComponent(meeting.title)}`
                  : doc.type === "financials"
                    ? `/documents?filter=Financials`
                    : doc.type === "policies"
                      ? `/documents?filter=Policies`
                      : `/documents?meeting=${encodeURIComponent(meeting.title)}`

              return (
                <Button key={doc.title} variant="secondary" asChild>
                  <Link href={href}>
                    <FileText className="h-4 w-4 mr-2" />
                    {doc.title}
                  </Link>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
