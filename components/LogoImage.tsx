'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getLogoIconPath, getCurrentLogo } from '@/lib/logo-utils';

interface LogoImageProps {
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

/**
 * Component that displays the appropriate logo based on the current date.
 * Automatically switches between Christmas tree (Nov 1 - Jan 1) and family tree logos.
 */
export function LogoImage({ 
  size = 192, 
  className = '', 
  alt = 'Family Tree Logo',
  priority = false 
}: LogoImageProps) {
  const [logoPath, setLogoPath] = useState(getLogoIconPath(size));
  const [logoType, setLogoType] = useState(getCurrentLogo());

  useEffect(() => {
    // Update logo if date changes (e.g., midnight transition)
    const checkLogoUpdate = () => {
      const currentLogo = getCurrentLogo();
      if (currentLogo !== logoType) {
        setLogoType(currentLogo);
        setLogoPath(getLogoIconPath(size));
      }
    };

    // Check daily at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      checkLogoUpdate();
      // Then check daily
      setInterval(checkLogoUpdate, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, [logoType, size]);

  return (
    <Image
      src={logoPath}
      alt={alt}
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
}
