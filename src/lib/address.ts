/**
 * Format address with unit number
 * If unitNumber is just a number, prefix it with "Unit "
 * Otherwise use it as-is
 */
export function formatAddressWithUnit(address: string, unitNumber: string): string {
  if (!unitNumber.trim()) {
    return address
  }

  // Check if unit number is just digits
  const isNumericOnly = /^\d+$/.test(unitNumber.trim())
  const formattedUnit = isNumericOnly ? `Unit ${unitNumber}` : unitNumber

  // Combine with newline for storage
  return `${address}\n${formattedUnit}`
}

/**
 * Parse stored address into main address and unit
 */
export function parseAddress(fullAddress: string | null): { address: string; unit: string } {
  if (!fullAddress) {
    return { address: '', unit: '' }
  }

  // Split by newline
  const parts = fullAddress.split('\n')
  
  if (parts.length === 1) {
    return { address: parts[0], unit: '' }
  }

  // Extract unit number if it starts with "Unit "
  const unitPart = parts[parts.length - 1]
  const unitMatch = unitPart.match(/^Unit (\d+)$/)
  
  return {
    address: parts.slice(0, -1).join('\n'),
    unit: unitMatch ? unitMatch[1] : unitPart
  }
}

/**
 * Format address for display (with line breaks)
 */
export function formatAddressForDisplay(fullAddress: string | null): string {
  if (!fullAddress) return ''
  
  // Replace newlines with <br /> for HTML or keep as-is for plain text
  return fullAddress.replace(/\n/g, '\n')
}
