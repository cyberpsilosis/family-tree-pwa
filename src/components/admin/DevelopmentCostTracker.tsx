'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, TrendingUp, Target, Users, Plus, Trash2 } from 'lucide-react'

interface DonationData {
  total: number
  count: number
}

interface Donation {
  id: string
  amount: number
  donorName: string | null
  donorEmail: string | null
  status: string
  createdAt: string
}

interface DonationListData {
  donations: Donation[]
}

interface DevCostItem {
  id: string
  description: string
  amount: number
  addedBy: string | null
  createdAt: string
}

interface DevCostData {
  items: DevCostItem[]
  totalCost: number
}

export function DevelopmentCostTracker() {
  const [donationData, setDonationData] = useState<DonationData | null>(null)
  const [donationList, setDonationList] = useState<Donation[]>([])
  const [devCostData, setDevCostData] = useState<DevCostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [donationsRes, donationDetailsRes, devCostsRes] = await Promise.all([
        fetch('/api/donations'),
        fetch('/api/admin/donations'),
        fetch('/api/admin/dev-cost-items')
      ])
      
      if (!donationsRes.ok) throw new Error('Failed to fetch donations')
      if (!donationDetailsRes.ok) throw new Error('Failed to fetch donation details')
      if (!devCostsRes.ok) throw new Error('Failed to fetch development costs')
      
      const donations = await donationsRes.json()
      const donationDetails = await donationDetailsRes.json()
      const devCosts = await devCostsRes.json()
      
      setDonationData(donations)
      setDonationList(donationDetails.donations)
      setDevCostData(devCosts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }


  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemDescription || !newItemAmount) return

    const amount = parseFloat(newItemAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setAdding(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/dev-cost-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newItemDescription,
          amount,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add cost item')
      }

      setNewItemDescription('')
      setNewItemAmount('')
      setSuccess(`Added cost item: ${newItemDescription}`)
      setTimeout(() => setSuccess(null), 3000)
      
      // Refresh data
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cost item?')) return

    try {
      setError(null)
      
      const response = await fetch(`/api/admin/dev-cost-items?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete cost item')
      }

      setSuccess('Cost item deleted')
      setTimeout(() => setSuccess(null), 3000)
      
      // Refresh data
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!donationData || !devCostData) return null

  const currentAmount = donationData.total
  const goalAmount = devCostData.totalCost || 200 // Fallback to $200 if no costs added
  const percentage = goalAmount > 0 ? Math.min((currentAmount / goalAmount) * 100, 100) : 0
  const remaining = Math.max(goalAmount - currentAmount, 0)

  return (
    <div className="space-y-6">
      {/* Progress Overview Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Donation Progress</h2>
                <p className="text-sm text-muted-foreground">Community contributions vs. development costs</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-4 w-full rounded-full bg-muted/30 overflow-hidden border border-border/50">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Raised</span>
                </div>
                <p className="text-2xl font-light text-foreground">
                  ${currentAmount.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>Goal</span>
                </div>
                <p className="text-2xl font-light text-foreground">
                  ${goalAmount.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Donors</span>
                </div>
                <p className="text-2xl font-light text-foreground">
                  {donationData.count}
                </p>
              </div>
            </div>

            {/* Status Message */}
            <div className="border-t border-border/30 pt-4">
              {remaining > 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  Only <span className="font-semibold text-primary">${remaining.toFixed(0)}</span> left to cover all development costs!
                </p>
              ) : (
                <p className="text-sm text-primary text-center font-semibold">
                  🎉 Development costs fully covered! Thank you to all {donationData.count} donors!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Cost Management */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Development Cost Items</h3>
                <p className="text-sm text-muted-foreground">Add line items for development expenses</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-semibold text-foreground">${goalAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Add New Item Form */}
            <form onSubmit={handleAddItem} className="flex gap-2 pt-4 border-t border-border/30">
              <Input
                type="text"
                placeholder="Description (e.g., Phase 1 development)"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                className="flex-1 bg-background/50"
                required
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount"
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                className="w-32 bg-background/50"
                required
              />
              <Button
                type="submit"
                disabled={adding}
                className="whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-1" />
                {adding ? 'Adding...' : 'Add'}
              </Button>
            </form>

            {/* Cost Items List */}
            {devCostData.items.length > 0 ? (
              <div className="space-y-2 pt-2">
                {devCostData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                        {item.addedBy && ` by ${item.addedBy}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-foreground">${item.amount.toFixed(2)}</p>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No cost items yet. Add your first development expense above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Donation Log */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Donation Log</h3>
                <p className="text-sm text-muted-foreground">Recent donations from family members</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-semibold text-primary">${currentAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Donations List */}
            {donationList.length > 0 ? (
              <div className="space-y-2 pt-4 border-t border-border/30">
                {donationList.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {donation.donorName || 'Anonymous'}
                        {donation.donorEmail && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({donation.donorEmail})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(donation.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-primary">${donation.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No donations yet. Share the app with family members to start receiving contributions!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm">
          {success}
        </div>
      )}
    </div>
  )
}
