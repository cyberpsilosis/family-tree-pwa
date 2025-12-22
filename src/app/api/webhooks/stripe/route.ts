import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
  })
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const body = await req.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured")
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object as Stripe.PaymentIntent
        console.log(`💰 Payment intent created: ${paymentIntentCreated.id}`)
        break

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`✅ Payment succeeded: ${paymentIntent.id}`)
        
        // Record the donation in the database
        try {
          const amount = paymentIntent.amount / 100
          const donorEmail = paymentIntent.receipt_email
          const donorName = paymentIntent.metadata.donor_name || paymentIntent.shipping?.name
          
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/donations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount,
              donorName: donorName || null,
              donorEmail: donorEmail || null,
              stripePaymentId: paymentIntent.id
            })
          })
        } catch (err) {
          console.error("Failed to record donation:", err)
        }
        break

      case "charge.succeeded":
        const charge = event.data.object as Stripe.Charge
        console.log(`💳 Charge succeeded: ${charge.id}`)
        break

      case "charge.updated":
        const chargeUpdated = event.data.object as Stripe.Charge
        console.log(`🔄 Charge updated: ${chargeUpdated.id}`)
        break

      case "payment_intent.payment_failed":
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent
        console.log(`❌ Payment failed: ${paymentIntentFailed.id}`)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Error processing webhook:", err)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
