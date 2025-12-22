import { DevelopmentCostTracker } from '@/components/admin/DevelopmentCostTracker'

export const dynamic = 'force-dynamic'

export default function DevCostPage() {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Atmospheric background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-60 w-60 rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Page Header */}
      <div className="relative mb-8 animate-fade-up stagger-1">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Admin Tools
        </p>
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground md:text-5xl">
          Donation <span className="font-semibold">Progress</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Track community contributions toward development costs
        </p>
      </div>

      {/* Tracker Component */}
      <div className="relative animate-fade-up stagger-2">
        <DevelopmentCostTracker />
      </div>
    </div>
  )
}
