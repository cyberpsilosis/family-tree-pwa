'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface NameAutocompleteProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
}

export function NameAutocomplete({
  value,
  onChange,
  suggestions,
  placeholder,
  disabled,
  className,
  label,
}: NameAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.length > 0) {
      const filtered = suggestions
        .filter(s => s.toLowerCase().includes(value.toLowerCase()))
        .filter(s => s.toLowerCase() !== value.toLowerCase())
        .slice(0, 5)
      
      setFilteredSuggestions(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setIsOpen(false)
    }
    setHighlightedIndex(-1)
  }, [value, suggestions])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          onChange(filteredSuggestions[highlightedIndex])
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      {label && (
        <label className="text-sm text-muted-foreground mb-2 block">{label}</label>
      )}
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute z-50 w-full mt-1 rounded-lg border border-border',
            'bg-popover shadow-lg overflow-hidden'
          )}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={cn(
                'px-3 py-2 text-sm cursor-pointer transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                highlightedIndex === index && 'bg-accent text-accent-foreground'
              )}
              onClick={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
