import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { DonationThankYouEmail } from '@/emails/donation-thank-you'

const resend = new Resend(process.env.RESEND_API_KEY)

// GET: Get total donations
export async function GET() {
  try {
    const donations = await prisma.donation.findMany({
      where: {
        status: "succeeded"
      }
    })
    
    const total = donations.reduce((sum, donation) => sum + donation.amount, 0)
    
    return NextResponse.json({
      total,
      count: donations.length
    })
  } catch (error: any) {
    console.error("Error fetching donations:", error)
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    )
  }
}

// POST: Record a new donation
export async function POST(req: NextRequest) {
  try {
    const { amount, donorName, donorEmail, stripePaymentId } = await req.json()
    
    if (!amount || !stripePaymentId) {
      return NextResponse.json(
        { error: "Amount and stripePaymentId are required" },
        { status: 400 }
      )
    }
    
    // Check if this payment was already recorded
    const existing = await prisma.donation.findUnique({
      where: { stripePaymentId }
    })
    
    if (existing) {
      return NextResponse.json(
        { error: "Donation already recorded" },
        { status: 400 }
      )
    }
    
    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        donorName: donorName || null,
        donorEmail: donorEmail || null,
        stripePaymentId,
        status: "succeeded"
      }
    })
    
    // Get updated total for email
    const allDonations = await prisma.donation.findMany({
      where: { status: "succeeded" }
    })
    const currentTotal = allDonations.reduce((sum, d) => sum + d.amount, 0)
    
    // Send thank you email
    if (donorEmail) {
      try {
        // Try to find user's theme preference
        const user = await prisma.user.findUnique({
          where: { email: donorEmail },
          select: { theme: true }
        })
        
        const emailHtml = await render(
          DonationThankYouEmail({
            donorName: donorName || undefined,
            amount: parseFloat(amount),
            currentTotal,
            goalAmount: 200,
            theme: user?.theme as 'light' | 'dark' | undefined
          }),
          {
            pretty: true
          }
        )
        
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Family Tree <noreply@familytree.lol>',
          to: donorEmail,
          subject: 'Thank you for your donation! 💚',
          html: emailHtml
        })
      } catch (emailError) {
        console.error('Failed to send thank you email:', emailError)
        // Don't fail the request if email fails
      }
    }
    
    return NextResponse.json({ donation })
  } catch (error: any) {
    console.error("Error recording donation:", error)
    return NextResponse.json(
      { error: "Failed to record donation" },
      { status: 500 }
    )
  }
}
