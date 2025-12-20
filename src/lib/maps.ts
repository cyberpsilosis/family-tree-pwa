/**
 * Generates a maps URL that opens the appropriate app based on the device
 * - iOS devices: Opens Apple Maps
 * - Android/other devices: Opens Google Maps
 */
export function getMapsUrl(address: string): string {
  const encodedAddress = encodeURIComponent(address)
  
  // Check if running on iOS (client-side only)
  if (typeof window !== 'undefined') {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    if (isIOS) {
      // Apple Maps URL scheme
      return `http://maps.apple.com/?q=${encodedAddress}`
    }
  }
  
  // Google Maps for Android and web (default)
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
}

/**
 * Opens the address in the appropriate maps application
 */
export function openInMaps(address: string): void {
  const url = getMapsUrl(address)
  window.open(url, '_blank', 'noopener,noreferrer')
}
