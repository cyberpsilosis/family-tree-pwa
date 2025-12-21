import { NextResponse } from 'next/server';
import { getManifestIcons } from '@/lib/logo-utils';

export async function GET() {
  const manifest = {
    name: 'Family Tree',
    short_name: 'FamilyTree',
    description: 'Family contact directory',
    start_url: '/',
    display: 'standalone',
    background_color: '#A3D5A3',
    theme_color: '#A3D5A3',
    icons: getManifestIcons()
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}
