import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generatePassword, hashPassword } from '@/lib/password'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// POST /api/admin/invite - Send invite email to new member
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      birthYear,
      birthday,
      phone,
      address,
      favoriteTeam,
      parentId,
      profilePhotoUrl,
      socialMedia,
    } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A member with this email already exists' },
        { status: 400 }
      )
    }

    // Generate password
    const password = generatePassword(firstName, lastName, birthYear)
    const hashedPassword = await hashPassword(password)

    // Build social media URLs
    const socialUrls: any = {}
    if (socialMedia) {
      if (socialMedia.instagram) {
        socialUrls.instagram = `https://instagram.com/${socialMedia.instagram}`
      }
      if (socialMedia.facebook) {
        socialUrls.facebook = `https://facebook.com/${socialMedia.facebook}`
      }
      if (socialMedia.twitter) {
        socialUrls.twitter = `https://x.com/${socialMedia.twitter}`
      }
      if (socialMedia.linkedin) {
        socialUrls.linkedin = `https://www.linkedin.com/in/${socialMedia.linkedin}`
      }
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        birthYear,
        birthday: new Date(birthday),
        phone: phone || null,
        address: address || null,
        favoriteTeam: favoriteTeam || null,
        parentId: parentId || null,
        profilePhotoUrl: profilePhotoUrl || null,
        password: hashedPassword,
        isAdmin: false,
        ...socialUrls,
      },
    })

    // Send invite email via Resend
    try {
      await resend.emails.send({
        from: 'Family Tree <onboarding@resend.dev>',
        to: email,
        subject: "You're invited to join our Family Tree!",
        html: `
          <h2>Welcome to our Family Tree, ${firstName}!</h2>
          <p>You've been invited to join our family contact directory and genealogy app.</p>
          
          <h3>Your Login Credentials</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> <code style="background: #f4f4f4; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${password}</code></p>
          
          <p>Click the link below to access the app:</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="display: inline-block; background: #7FB57F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Open Family Tree App</a></p>
          
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #ddd;" />
          
          <h3>Install on Your Mobile Device</h3>
          <p>For the best experience, install the app on your phone:</p>
          <ol>
            <li>Open the link above in your mobile browser (Safari on iPhone, Chrome on Android)</li>
            <li>Tap the <strong>Share</strong> button (iPhone) or <strong>Menu</strong> (Android)</li>
            <li>Select <strong>"Add to Home Screen"</strong></li>
            <li>The app icon will appear on your home screen</li>
          </ol>
          
          <p style="color: #666; font-size: 14px; margin-top: 32px;">
            This is a Progressive Web App (PWA) - it works just like a native app once installed!
          </p>
        `,
      })
    } catch (emailError) {
      console.error('Error sending invite email:', emailError)
      // User was created but email failed - return partial success
      return NextResponse.json(
        {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          emailSent: false,
          error: 'User created but email delivery failed. Please share the password manually.',
          password, // Include password so admin can share it manually
        },
        { status: 207 } // Multi-status
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      emailSent: true,
    })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
