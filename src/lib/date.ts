/**
 * Converts a Date object to YYYY-MM-DD format
 * Uses UTC to avoid timezone shifts since birthdays are timezone-agnostic
 */
export function toDateInputValue(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converts YYYY-MM-DD string to Date object at midnight UTC
 * (prevents timezone shift when storing in database)
 */
export function fromDateInputValue(dateString: string): Date {
  // Parse as YYYY-MM-DD and create at midnight UTC
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * Formats a birthday for display
 * Birthdays are timezone-agnostic, so we use UTC methods
 */
export function formatBirthday(birthday: string | Date, format: 'short' | 'long' = 'short'): string {
  const date = typeof birthday === 'string' ? new Date(birthday) : birthday
  
  // Use UTC methods since birthdays are stored as UTC dates
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  
  if (format === 'long') {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December']
    return `${monthNames[month]} ${day}, ${year}`
  }
  
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${monthNamesShort[month]} ${day}, ${year}`
}

/**
 * Calculates age from birthday
 * Birthdays are timezone-agnostic, so we compare UTC values
 */
export function calculateAge(birthday: string | Date): number {
  const birthDate = typeof birthday === 'string' ? new Date(birthday) : birthday
  const today = new Date()
  
  // Use UTC methods for birthday, local for today
  let age = today.getFullYear() - birthDate.getUTCFullYear()
  const monthDiff = today.getMonth() - birthDate.getUTCMonth()
  const dayDiff = today.getDate() - birthDate.getUTCDate()
  
  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--
  }
  
  return age
}
