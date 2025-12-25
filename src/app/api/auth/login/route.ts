import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword } from '@/lib/password'
import { generateToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password, stayLoggedIn = false, mode } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Check if it's family join password (for /join page)
    const familyPassword = process.env.FAMILY_PASSWORD
    if (mode === 'join' && familyPassword && password === familyPassword) {
      // Set a session cookie to allow access to registration endpoint
      const response = NextResponse.json({
        success: true,
        isJoinAccess: true,
      })
      
      response.cookies.set('family-password-session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      })
      
      return response
    }

    // Check if it's admin password
    const adminPassword = process.env.ADMIN_PASSWORD
    if (adminPassword && password === adminPassword) {
      // Find or create admin user
      let admin = await prisma.admin.findFirst()
      
      if (!admin) {
        admin = await prisma.admin.create({
          data: {
            email: 'admin@familytree.com',
            password: adminPassword,
          },
        })
      }

      const token = generateToken({
        userId: admin.id,
        email: admin.email,
        isAdmin: true,
      }, stayLoggedIn)

      const response = NextResponse.json({
        success: true,
        isAdmin: true,
      })

      const maxAge = stayLoggedIn 
        ? 60 * 60 * 24 * 30 // 30 days
        : 60 * 60 * 24 * 7   // 7 days

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      })

      return response
    }

    // Try to find user by matching password
    const users = await prisma.user.findMany()
    
    for (const user of users) {
      const isMatch = await comparePassword(password, user.password)
      
      if (isMatch) {
      const token = generateToken({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      }, stayLoggedIn)

      const response = NextResponse.json({
        success: true,
        isAdmin: user.isAdmin,
      })

      const maxAge = stayLoggedIn 
        ? 60 * 60 * 24 * 30 // 30 days
        : 60 * 60 * 24 * 7   // 7 days

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      })

        return response
      }
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
