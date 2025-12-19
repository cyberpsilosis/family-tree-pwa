import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Video, FileText, ExternalLink } from "lucide-react"
import Link from "next/link"
import { meetings } from "@/lib/data/meetings"

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function MeetingCard({ meeting }: { meeting: (typeof meetings)[0] }) {
  return (
    <Card className="bg-card hover:border-primary/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium">{meeting.title}</h3>
                <Badge variant={meeting.type === "Board Meeting" ? "default" : "secondary"} className="mt-1">
                  {meeting.type}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(meeting.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{meeting.time}</span>
              </div>
              <div className="flex items-center gap-2">
                {meeting.isVirtual ? (
                  <>
                    <Video className="h-4 w-4" />
                    <a
                      href={meeting.virtualLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Join Zoom Meeting
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>{meeting.location}</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{meeting.description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {meeting.documents.map((doc) => {
            // View Agenda goes to meeting detail page
            if (doc.title === "Agenda" || doc.title === "Minutes") {
              return (
                <Link
                  key={doc.title}
                  href={`/meetings/${meeting.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/80 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View {doc.title}
                </Link>
              )
            }
            // Board Packet goes to documents with filter
            if (doc.title === "Board Packet") {
              return (
                <Link
                  key={doc.title}
                  href={`/documents?filter=Board Books&meeting=${encodeURIComponent(meeting.title)}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/80 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View {doc.title}
                </Link>
              )
            }
            // Other documents go to documents page with appropriate filter
            return (
              <Link
                key={doc.title}
                href={`/documents?meeting=${encodeURIComponent(meeting.title)}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/80 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                {doc.title}
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function MeetingsPage() {
  const upcomingMeetings = meetings.filter((m) => m.status === "upcoming")
  const pastMeetings = meetings.filter((m) => m.status === "past")

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Meetings</h1>
        <p className="mt-1 text-muted-foreground">Board and committee meetings schedule</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({upcomingMeetings.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastMeetings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingMeetings.length > 0 ? (
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          ) : (
            <Card className="bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-medium">No upcoming meetings</h3>
                <p className="mt-1 text-sm text-muted-foreground">Check back later for scheduled meetings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastMeetings.length > 0 ? (
            <div className="space-y-4">
              {pastMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          ) : (
            <Card className="bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-medium">No past meetings</h3>
                <p className="mt-1 text-sm text-muted-foreground">Past meetings will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
