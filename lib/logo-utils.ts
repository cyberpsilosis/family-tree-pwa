/**
 * Determines which logo to use based on the current date.
 * Christmas tree logo: November 1st - January 1st
 * Family tree logo: All other days
 */
export function getCurrentLogo(): 'christmas' | 'family' {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (Jan is 0, Dec is 11)
  
  // November (10), December (11), or January (0)
  const isChristmasSeason = month >= 10 || month === 0;
  
  return isChristmasSeason ? 'christmas' : 'family';
}

/**
 * Gets the path to the current logo icon
 */
export function getLogoIconPath(size: number = 192): string {
  const logo = getCurrentLogo();
  return `/icons/${logo}-tree-${size}x${size}.png`;
}

/**
 * Gets the path to the favicon
 */
export function getFaviconPath(): string {
  return '/favicon.ico';
}

/**
 * Gets all icon sizes for PWA manifest
 */
export function getManifestIcons() {
  const logo = getCurrentLogo();
  const sizes = [192, 512];
  
  return sizes.map(size => ({
    src: `/icons/${logo}-tree-${size}x${size}.png`,
    sizes: `${size}x${size}`,
    type: 'image/png',
    purpose: 'any maskable'
  }));
}
