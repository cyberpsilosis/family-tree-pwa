import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone } from "lucide-react"

const people = [
  {
    id: "1",
    name: "Jane Doe",
    role: "Chair",
    title: "CEO, Tech Ventures Inc.",
    email: "jane.doe@example.com",
    phone: "+1 (555) 123-4567",
    committees: ["Executive", "Governance"],
    avatar: "/professional-woman-headshot.png",
  },
  {
    id: "2",
    name: "Robert Chen",
    role: "Vice Chair",
    title: "Managing Partner, Summit Capital",
    email: "robert.chen@example.com",
    phone: "+1 (555) 234-5678",
    committees: ["Finance", "Executive"],
    avatar: "/professional-asian-man-headshot.png",
  },
  {
    id: "3",
    name: "Sarah Williams",
    role: "Director",
    title: "CFO, Global Industries",
    email: "sarah.williams@example.com",
    phone: "+1 (555) 345-6789",
    committees: ["Finance", "Audit"],
    avatar: "/professional-woman-cfo-headshot.jpg",
  },
  {
    id: "4",
    name: "Michael Thompson",
    role: "Director",
    title: "Retired CEO",
    email: "michael.t@example.com",
    phone: "+1 (555) 456-7890",
    committees: ["Governance", "Compensation"],
    avatar: "/professional-older-man-headshot.png",
  },
  {
    id: "5",
    name: "Emily Rodriguez",
    role: "Director",
    title: "Partner, Legal Associates LLP",
    email: "emily.r@example.com",
    phone: "+1 (555) 567-8901",
    committees: ["Governance"],
    avatar: "/professional-latina-woman-headshot.png",
  },
  {
    id: "6",
    name: "David Park",
    role: "Observer",
    title: "Investment Director, Venture Fund",
    email: "david.park@example.com",
    phone: "+1 (555) 678-9012",
    committees: [],
    avatar: "/professional-korean-man-headshot.png",
  },
]

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "Chair":
      return "default"
    case "Vice Chair":
      return "secondary"
    case "Observer":
      return "outline"
    default:
      return "secondary"
  }
}

export default function PeoplePage() {
  const directors = people.filter((p) => p.role !== "Observer")
  const observers = people.filter((p) => p.role === "Observer")

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">People</h1>
        <p className="mt-1 text-muted-foreground">Board members and observers directory</p>
      </div>

      {/* Directors Section */}
      <section>
        <h2 className="mb-4 text-lg font-medium">Board of Directors</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {directors.map((person) => (
            <Card key={person.id} className="bg-card hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                    <AvatarFallback className="bg-secondary text-lg">
                      {person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-4">
                    <h3 className="font-medium">{person.name}</h3>
                    <Badge variant={getRoleBadgeVariant(person.role)} className="mt-1">
                      {person.role}
                    </Badge>
                    <p className="mt-2 text-sm text-muted-foreground">{person.title}</p>
                  </div>
                  {person.committees.length > 0 && (
                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {person.committees.map((committee) => (
                        <Badge key={committee} variant="outline" className="text-xs">
                          {committee}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`mailto:${person.email}`}
                      className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                      aria-label={`Email ${person.name}`}
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                    <a
                      href={`tel:${person.phone}`}
                      className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                      aria-label={`Call ${person.name}`}
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Observers Section */}
      {observers.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-medium">Observers</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {observers.map((person) => (
              <Card key={person.id} className="bg-card hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                      <AvatarFallback className="bg-secondary text-lg">
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="mt-4">
                      <h3 className="font-medium">{person.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        {person.role}
                      </Badge>
                      <p className="mt-2 text-sm text-muted-foreground">{person.title}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <a
                        href={`mailto:${person.email}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                        aria-label={`Email ${person.name}`}
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <a
                        href={`tel:${person.phone}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                        aria-label={`Call ${person.name}`}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
