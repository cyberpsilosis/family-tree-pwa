import { Metadata } from 'next';
import { getLogoIconPath } from './logo-utils';

export function generateMetadata(): Metadata {
  const iconPath = getLogoIconPath(192);
  
  return {
    title: 'Family Tree',
    description: 'Family contact directory',
    manifest: '/api/manifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Family Tree',
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '32x32' },
        { url: iconPath, sizes: '192x192' },
      ],
      apple: [
        { url: iconPath, sizes: '192x192' },
      ],
    },
  };
}
