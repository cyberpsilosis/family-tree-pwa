import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json()

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum donation is $1." },
        { status: 400 }
      )
    }

    // Create payment intent (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      payment_method_types: [
        "card",
        "link",
        "cashapp",
      ],
      metadata: {
        type: "donation",
        source: "family_tree_app",
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error("Payment intent creation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    )
  }
}
