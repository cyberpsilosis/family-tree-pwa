import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Generate password in format: [first-initial][lastname][yy]
 * Example: John Smith born 1999 → jsmith99
 */
export function generatePassword(
  firstName: string,
  lastName: string,
  birthYear: number
): string {
  const firstInitial = firstName.charAt(0).toLowerCase()
  const lastNameLower = lastName.toLowerCase()
  const yearShort = birthYear.toString().slice(-2)
  return `${firstInitial}${lastNameLower}${yearShort}`
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Validate password format: [a-z][a-z]+[0-9]{2}
 */
export function isValidPasswordFormat(password: string): boolean {
  return /^[a-z][a-z]+\d{2}$/.test(password)
}
