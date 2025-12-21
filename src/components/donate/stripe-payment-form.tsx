"use client"

import { useState } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ReloadIcon } from "@radix-ui/react-icons"

interface StripePaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string, donorName?: string, donorEmail?: string) => void
  onError: (error: string) => void
  userEmail?: string
  userName?: string
}

export const StripePaymentForm = ({ amount, onSuccess, onError, userEmail, userName }: StripePaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [email, setEmail] = useState(userEmail || "")
  const [name, setName] = useState(userName || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}`,
          receipt_email: email,
          ...(name ? { payment_method_data: { billing_details: { name } } } : {}),
        },
      })

      if (error) {
        onError(error.message || "Payment failed")
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id, name, email)
        setIsProcessing(false)
      } else {
        onError("Payment processing failed. Please try again.")
        setIsProcessing(false)
      }
    } catch (err: any) {
      onError(err.message || "An unexpected error occurred")
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Name (optional)</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
          className="mb-4 bg-background/50 border-forest/30"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Email for receipt</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="bg-background/50 border-forest/30"
        />
      </div>
      
      <PaymentElement
        options={{
          layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: false,
            spacedAccordionItems: true
          },
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
          paymentMethodOrder: ['cashapp', 'apple_pay', 'google_pay', 'link', 'card'],
        }}
      />
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 bg-forest/20 border-2 border-forest/40 hover:bg-forest/30 hover:border-forest/60 shadow-[0_0_25px_rgba(163,213,163,0.6)] hover:shadow-[0_0_35px_rgba(163,213,163,0.8)] text-foreground font-bold text-base transition-all"
      >
        {isProcessing ? (
          <>
            <ReloadIcon className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Confirm Donation of $${amount}`
        )}
      </Button>
    </form>
  )
}
