"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cross1Icon } from "@radix-ui/react-icons"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { StripePaymentForm } from "./stripe-payment-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const DURATION = 0.3
const EASE_OUT = "easeOut"
const GOAL_AMOUNT = 200 // $200 goal

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface DonateModalProps {
  isOpen: boolean
  onClose: () => void
  currentDonations?: number // Total donations so far
  userEmail?: string // Current user's email to auto-fill
  userName?: string // Current user's name to auto-fill
}

export const DonateModal = ({ isOpen, onClose, currentDonations = 0, userEmail, userName }: DonateModalProps) => {
  const [amount, setAmount] = useState("10")
  const [clientSecret, setClientSecret] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const progressPercentage = Math.min((currentDonations / GOAL_AMOUNT) * 100, 100)
  const remaining = Math.max(GOAL_AMOUNT - currentDonations, 0)

  if (!isOpen) return null

  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    
    if (!amountNum || amountNum < 1) {
      setError("Please enter an amount of $1 or more")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment intent")
      }

      setClientSecret(data.clientSecret)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string, donorName?: string, donorEmail?: string) => {
    // Record the donation in the database
    try {
      await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          donorName: donorName || null,
          donorEmail: donorEmail || null,
          stripePaymentId: paymentIntentId
        })
      })
    } catch (err) {
      console.error("Failed to record donation:", err)
    }
    
    setSuccess(true)
    setTimeout(() => {
      onClose()
      setSuccess(false)
      setClientSecret("")
      setAmount("10")
      // Reload to get updated donation total
      window.location.reload()
    }, 2000)
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleBack = () => {
    setClientSecret("")
    setError("")
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DURATION, ease: EASE_OUT }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: DURATION, ease: EASE_OUT }}
          className="relative flex flex-col max-w-sm w-full max-h-[90vh] backdrop-blur-xl border-2 border-forest/50 bg-background/85 rounded-3xl ring-1 ring-offset-primary/10 ring-forest/40 ring-offset-2 shadow-[0_0_40px_rgba(163,213,163,0.5)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-forest/20">
            <h2 className="font-serif italic text-lg text-foreground">
              Support Family Tree
            </h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-full hover:bg-forest/20 transition-colors"
            >
              <Cross1Icon className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col p-6 gap-4 overflow-y-auto">
            {success ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-forest text-4xl mb-4"
                >
                  ✓
                </motion.div>
                <p className="text-foreground text-lg font-medium">Thank you for your donation!</p>
                <p className="text-foreground/60 text-sm mt-2">Your support means everything to us.</p>
              </div>
            ) : !clientSecret ? (
              <>
                {/* Progress Bar Section */}
                <div className="space-y-3 pb-4 border-b border-forest/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/80">Goal Progress</span>
                    <span className="text-forest font-semibold">
                      ${currentDonations.toFixed(0)} / ${GOAL_AMOUNT}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative h-3 bg-background/40 rounded-full overflow-hidden border border-forest/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-forest/80 to-forest rounded-full shadow-[0_0_10px_rgba(163,213,163,0.6)]"
                    />
                  </div>
                  
                  <p className="text-xs text-center text-foreground/60">
                    {remaining > 0 ? (
                      <>Only ${remaining.toFixed(0)} left to reach our goal!</>
                    ) : (
                      <>🎉 Goal reached! Thank you for your support!</>
                    )}
                  </p>
                </div>

                <p className="text-center text-foreground/80 text-sm">
                  Help us cover the ${GOAL_AMOUNT} it cost to build this app. Every contribution matters!
                </p>

                {/* Amount Selection */}
                <form onSubmit={handleAmountSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-foreground/80 mb-2 block">Donation Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">$</span>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        step="1"
                        className="pl-7"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex gap-2">
                    {[5, 10, 25, 50].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(String(amt))}
                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-background/20 hover:bg-forest/10 transition-colors border border-forest/30"
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest/20 border-forest/40 hover:bg-forest/25 hover:border-forest/50 shadow-[0_0_25px_rgba(163,213,163,0.5)] hover:shadow-[0_0_30px_rgba(163,213,163,0.6)] text-foreground font-semibold"
                  >
                    {loading ? "Loading..." : "Continue to Payment"}
                  </Button>
                </form>

                {/* Payment Methods Info */}
                <div className="flex flex-col items-center gap-3 w-full pt-4 border-t border-forest/20">
                  <p className="text-sm text-foreground/80 font-medium">Or pay directly:</p>
                  <div className="flex items-center gap-4">
                    {/* Venmo */}
                    <a 
                      href="https://venmo.com/u/reoccurringrabbit" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-background/30 hover:bg-background/40 transition-colors border border-forest/30 hover:border-forest/50"
                    >
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#3D95CE">
                        <path d="M19.384 3.054c.556.959.806 2.081.806 3.463 0 4.305-3.66 9.911-6.648 13.428H6.844L4.616 3.9l5.741-.644 1.429 12.688c1.429-2.292 3.343-5.925 3.343-8.717 0-1.429-.25-2.481-.644-3.173l4.899-.999z"/>
                      </svg>
                      <span className="text-sm font-semibold text-foreground">Venmo</span>
                    </a>
                    
                    {/* Zelle */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('5306633436')
                        alert('Zelle number (530-663-3436) copied to clipboard!')
                      }}
                      className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-background/30 hover:bg-background/40 transition-colors border border-forest/30 hover:border-forest/50"
                      title="Click to copy Zelle number"
                    >
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#6D1ED4">
                        <path d="M22.5 9.4v5.2c0 .4-.3.7-.7.7h-7.6v5.9c0 .4-.3.7-.7.7H9.4c-.4 0-.7-.3-.7-.7v-5.9H1.2c-.4 0-.7-.3-.7-.7V9.4c0-.4.3-.7.7-.7h7.5V2.8c0-.4.3-.7.7-.7h4.1c.4 0 .7.3.7.7v5.9h7.6c.4 0 .7.3.7.7z"/>
                      </svg>
                      <span className="text-sm font-semibold text-foreground">Zelle</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2">
                  <button
                    onClick={handleBack}
                    className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                  >
                    ← Back
                  </button>
                  <p className="text-sm text-foreground/80 mt-2">
                    Donating <span className="font-semibold">${amount}</span>
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Stripe Payment Form */}
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#A3D5A3",
                        colorBackground: "rgba(255, 255, 255, 0.05)",
                        colorText: "#ffffff",
                        colorTextSecondary: "#d1d5db",
                        colorDanger: "#ef4444",
                        borderRadius: "0.75rem",
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontSizeBase: '15px',
                        spacingUnit: '4px',
                      },
                      rules: {
                        '.Input': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(163, 213, 163, 0.3)',
                          boxShadow: 'none',
                        },
                        '.Input:focus': {
                          border: '1px solid rgba(163, 213, 163, 0.5)',
                          boxShadow: '0 0 0 1px rgba(163, 213, 163, 0.3)',
                        },
                        '.Label': {
                          color: '#e5e7eb',
                          fontWeight: '500',
                          fontSize: '14px',
                        },
                        '.Tab': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(163, 213, 163, 0.3)',
                        },
                        '.Tab:hover': {
                          backgroundColor: 'rgba(163, 213, 163, 0.1)',
                        },
                        '.Tab--selected': {
                          backgroundColor: 'rgba(163, 213, 163, 0.15)',
                          border: '1px solid rgba(163, 213, 163, 0.5)',
                        },
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    amount={parseFloat(amount)}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    userEmail={userEmail}
                    userName={userName}
                  />
                </Elements>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
