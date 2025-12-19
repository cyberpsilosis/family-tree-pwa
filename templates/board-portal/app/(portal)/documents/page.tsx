"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, FileSpreadsheet, File, ExternalLink, X } from "lucide-react"
import Link from "next/link"

const documents = [
  {
    id: "1",
    title: "Q4 2025 Board Packet",
    category: "Board Books",
    meeting: "Q4 Board Meeting",
    fileType: "pdf",
    updatedAt: "2025-11-25",
    oneDriveUrl: "https://onedrive.example.com/board-packet-q4-2025.pdf",
  },
  {
    id: "2",
    title: "Q3 Financial Report",
    category: "Financials",
    meeting: "Q3 Board Meeting",
    fileType: "xlsx",
    updatedAt: "2025-09-15",
    oneDriveUrl: "https://onedrive.example.com/q3-financials.xlsx",
  },
  {
    id: "3",
    title: "Corporate Bylaws",
    category: "Policies",
    meeting: null,
    fileType: "pdf",
    updatedAt: "2025-01-10",
    oneDriveUrl: "https://onedrive.example.com/bylaws.pdf",
  },
  {
    id: "4",
    title: "Board Meeting Minutes - Q3 2025",
    category: "Board Books",
    meeting: "Q3 Board Meeting",
    fileType: "docx",
    updatedAt: "2025-09-20",
    oneDriveUrl: "https://onedrive.example.com/minutes-q3-2025.docx",
  },
  {
    id: "5",
    title: "Finance Committee Charter",
    category: "Committee Docs",
    meeting: null,
    fileType: "pdf",
    updatedAt: "2025-03-15",
    oneDriveUrl: "https://onedrive.example.com/finance-charter.pdf",
  },
  {
    id: "6",
    title: "2026 Strategic Plan Draft",
    category: "Strategy",
    meeting: "Q4 Board Meeting",
    fileType: "pdf",
    updatedAt: "2025-11-20",
    oneDriveUrl: "https://onedrive.example.com/strategic-plan-2026.pdf",
  },
  {
    id: "7",
    title: "YTD Budget vs Actual",
    category: "Financials",
    meeting: "Q4 Board Meeting",
    fileType: "xlsx",
    updatedAt: "2025-11-22",
    oneDriveUrl: "https://onedrive.example.com/budget-ytd.xlsx",
  },
  {
    id: "8",
    title: "Governance Committee Meeting Notes",
    category: "Committee Docs",
    meeting: "Governance Committee Meeting",
    fileType: "docx",
    updatedAt: "2025-08-26",
    oneDriveUrl: "https://onedrive.example.com/governance-notes.docx",
  },
]

const categories = ["All", "Board Books", "Financials", "Policies", "Committee Docs", "Strategy"]

function getFileIcon(fileType: string) {
  switch (fileType) {
    case "xlsx":
      return FileSpreadsheet
    case "pdf":
    case "docx":
      return FileText
    default:
      return File
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function DocumentCard({ document }: { document: (typeof documents)[0] }) {
  const FileIcon = getFileIcon(document.fileType)

  return (
    <a href={document.oneDriveUrl} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="bg-card hover:border-primary/30 transition-colors group">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">
                  {document.title}
                </h3>
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2">
                  {document.category}
                </Badge>
                <span className="text-[10px] sm:text-xs uppercase font-mono">{document.fileType}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-[10px] sm:text-xs">{formatDate(document.updatedAt)}</span>
              </div>
              {document.meeting && (
                <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
                  Related: {document.meeting}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}

export default function DocumentsPage() {
  const searchParams = useSearchParams()
  const filterParam = searchParams.get("filter")
  const meetingParam = searchParams.get("meeting")

  const activeCategory = filterParam && categories.includes(filterParam) ? filterParam : "All"

  let filteredDocs = activeCategory === "All" ? documents : documents.filter((d) => d.category === activeCategory)

  // Further filter by meeting if specified
  if (meetingParam) {
    filteredDocs = filteredDocs.filter((d) => d.meeting === meetingParam)
  }

  const hasActiveFilters = filterParam || meetingParam

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight md:text-3xl">Documents</h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">Board materials and reference documents</p>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {filterParam && (
            <Badge variant="secondary" className="gap-1">
              {filterParam}
              <Link href={meetingParam ? `/documents?meeting=${encodeURIComponent(meetingParam)}` : "/documents"}>
                <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
              </Link>
            </Badge>
          )}
          {meetingParam && (
            <Badge variant="secondary" className="gap-1">
              {meetingParam}
              <Link href={filterParam ? `/documents?filter=${encodeURIComponent(filterParam)}` : "/documents"}>
                <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
              </Link>
            </Badge>
          )}
          <Link href="/documents" className="text-sm text-primary hover:underline">
            Clear all
          </Link>
        </div>
      )}

      {/* Category tabs */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
        <div className="flex w-max sm:w-auto sm:flex-wrap gap-1.5 sm:gap-1 pb-2 sm:pb-0">
          {categories.map((category) => {
            const isActive = category === activeCategory
            const href =
              category === "All"
                ? meetingParam
                  ? `/documents?meeting=${encodeURIComponent(meetingParam)}`
                  : "/documents"
                : meetingParam
                  ? `/documents?filter=${encodeURIComponent(category)}&meeting=${encodeURIComponent(meetingParam)}`
                  : `/documents?filter=${encodeURIComponent(category)}`

            return (
              <Link
                key={category}
                href={href}
                className={`shrink-0 rounded-full border px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-card hover:bg-secondary"
                }`}
              >
                {category}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Document list */}
      {filteredDocs.length > 0 ? (
        <div className="grid gap-2 sm:gap-3">
          {filteredDocs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <Card className="bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium">No documents found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No documents match the current filters.{" "}
              <Link href="/documents" className="text-primary hover:underline">
                Clear filters
              </Link>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
