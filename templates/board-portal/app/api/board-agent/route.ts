import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

const BOARD_DATA = {
  meetings: [
    {
      id: "1",
      title: "Q4 Board Meeting",
      date: "2025-12-15",
      time: "9:00 AM - 12:00 PM EST",
      type: "Board Meeting",
      location: "Conference Room A, 123 Main St, Boston, MA",
      isVirtual: false,
      status: "upcoming",
      description: "Quarterly board meeting to review Q4 performance, 2026 budget approval, and strategic initiatives.",
    },
    {
      id: "2",
      title: "Finance Committee Meeting",
      date: "2025-12-08",
      time: "2:00 PM - 3:30 PM EST",
      type: "Committee",
      location: "Zoom",
      isVirtual: true,
      status: "upcoming",
      description: "Review of Q4 financial statements and 2026 budget recommendations.",
    },
    {
      id: "3",
      title: "Q3 Board Meeting",
      date: "2025-09-18",
      time: "9:00 AM - 12:00 PM EST",
      type: "Board Meeting",
      location: "Conference Room A, 123 Main St, Boston, MA",
      isVirtual: false,
      status: "past",
      description: "Quarterly board meeting to review Q3 performance and strategic updates.",
    },
    {
      id: "4",
      title: "Governance Committee Meeting",
      date: "2025-08-25",
      time: "3:00 PM - 4:00 PM EST",
      type: "Committee",
      location: "Zoom",
      isVirtual: true,
      status: "past",
      description: "Annual governance review and policy updates.",
    },
  ],
  documents: [
    {
      id: "1",
      title: "Q4 2025 Board Packet",
      category: "Board Books",
      meeting: "Q4 Board Meeting",
      updatedAt: "2025-11-25",
    },
    {
      id: "2",
      title: "Q3 Financial Report",
      category: "Financials",
      meeting: "Q3 Board Meeting",
      updatedAt: "2025-09-15",
    },
    { id: "3", title: "Corporate Bylaws", category: "Policies", meeting: null, updatedAt: "2025-01-10" },
    {
      id: "4",
      title: "Board Meeting Minutes - Q3 2025",
      category: "Board Books",
      meeting: "Q3 Board Meeting",
      updatedAt: "2025-09-20",
    },
    { id: "5", title: "Finance Committee Charter", category: "Committee Docs", meeting: null, updatedAt: "2025-03-15" },
    {
      id: "6",
      title: "2026 Strategic Plan Draft",
      category: "Strategy",
      meeting: "Q4 Board Meeting",
      updatedAt: "2025-11-20",
    },
    {
      id: "7",
      title: "YTD Budget vs Actual",
      category: "Financials",
      meeting: "Q4 Board Meeting",
      updatedAt: "2025-11-22",
    },
    {
      id: "8",
      title: "Governance Committee Meeting Notes",
      category: "Committee Docs",
      meeting: "Governance Committee Meeting",
      updatedAt: "2025-08-26",
    },
  ],
  people: [
    {
      id: "1",
      name: "Jane Doe",
      role: "Chair",
      title: "CEO, Tech Ventures Inc.",
      committees: ["Executive", "Governance"],
    },
    {
      id: "2",
      name: "Robert Chen",
      role: "Vice Chair",
      title: "Managing Partner, Summit Capital",
      committees: ["Finance", "Executive"],
    },
    {
      id: "3",
      name: "Sarah Williams",
      role: "Director",
      title: "CFO, Global Industries",
      committees: ["Finance", "Audit"],
    },
    {
      id: "4",
      name: "Michael Thompson",
      role: "Director",
      title: "Retired CEO",
      committees: ["Governance", "Compensation"],
    },
    {
      id: "5",
      name: "Emily Rodriguez",
      role: "Director",
      title: "Partner, Legal Associates LLP",
      committees: ["Governance"],
    },
    { id: "6", name: "David Park", role: "Observer", title: "Investment Director, Venture Fund", committees: [] },
  ],
}

const SYSTEM_PROMPT = `You are the Board Agent for a mid-market company (~$20M revenue). Your audience is exclusively board directors, observers, and board liaisons—senior professionals who value brevity.

COMMUNICATION RULES:
- Be extremely concise. Directors are busy. Get to the point.
- No preamble or filler. Skip "Great question!" or "I'd be happy to help."
- Use bullet points for multiple items.
- Assume board-level sophistication—don't over-explain basic concepts.
- When referencing data, give the answer first, then details if needed.

Your role: governance guidance, meeting prep, fiduciary duties, and answering questions about meetings, members, and documents using the data below.

=== BOARD DATA ===

MEETINGS:
${BOARD_DATA.meetings
  .map(
    (m) => `• ${m.title} | ${m.date} ${m.time} | ${m.isVirtual ? "Virtual" : m.location} | ${m.status.toUpperCase()}`,
  )
  .join("\n")}

MEMBERS:
${BOARD_DATA.people.map((p) => `• ${p.name} (${p.role})${p.committees.length ? ` – ${p.committees.join(", ")}` : ""}`).join("\n")}

DOCUMENTS:
${BOARD_DATA.documents.map((d) => `• ${d.title} | ${d.category}${d.meeting ? ` | ${d.meeting}` : ""}`).join("\n")}

=== END DATA ===`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: "anthropic/claude-sonnet-4-20250514",
    system: SYSTEM_PROMPT,
    messages: prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  })
}
