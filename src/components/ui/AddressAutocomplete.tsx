'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from './input'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = '123 Main St, City, State ZIP',
  disabled,
  className,
  label,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load Google Places API script
    const loadGoogleMapsScript = () => {
      if (typeof window === 'undefined') return

      // Check if already loaded
      if (window.google?.maps?.places) {
        setIsLoaded(true)
        return
      }

      // Check if script already exists
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkLoaded = setInterval(() => {
          if (window.google?.maps?.places) {
            setIsLoaded(true)
            clearInterval(checkLoaded)
          }
        }, 100)
        return
      }

      const script = document.createElement('script')
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        console.warn('Google Maps API key not found. Address autocomplete will not work.')
        return
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    }

    loadGoogleMapsScript()
  }, [])

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return

    try {
      // Initialize Google Places Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' }, // Restrict to US addresses
        }
      )

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        if (place?.formatted_address) {
          onChange(place.formatted_address)
        }
      })
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error)
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onChange])

  return (
    <div>
      {label && (
        <label className="text-sm text-muted-foreground mb-2 block">{label}</label>
      )}
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        autoComplete="off"
      />
      {!isLoaded && !disabled && (
        <p className="text-xs text-muted-foreground mt-1">
          Loading address suggestions...
        </p>
      )}
    </div>
  )
}

// Type declaration for Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}
