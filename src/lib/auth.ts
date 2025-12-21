import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRY_SHORT = '7d' // 7 days (default)
const JWT_EXPIRY_LONG = '30d' // 30 days (stay logged in)

export interface TokenPayload {
  userId: string
  email: string
  isAdmin: boolean
}

/**
 * Generate a JWT token with optional extended expiry
 */
export function generateToken(payload: TokenPayload, stayLoggedIn = false): string {
  const expiry = stayLoggedIn ? JWT_EXPIRY_LONG : JWT_EXPIRY_SHORT
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiry })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

/**
 * Set authentication cookie with optional extended expiry
 */
export async function setAuthCookie(token: string, stayLoggedIn = false) {
  const cookieStore = await cookies()
  const maxAge = stayLoggedIn 
    ? 60 * 60 * 24 * 30 // 30 days
    : 60 * 60 * 24 * 7   // 7 days
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  })
}

/**
 * Get authentication token from cookies
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('auth-token')?.value || null
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getAuthToken()
  if (!token) return null
  return verifyToken(token)
}
