'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

export interface SearchResult {
  id: string
  title: string
  content?: string
  highlight?: string
  updatedAt: string
  document: any
}

export interface SearchResponse {
  hits: SearchResult[]
  found: number
  page: number
  search_time_ms: number
}

export interface HeadlessSearchInputProps {
  /**
   * Base URL of your Payload CMS instance
   */
  baseUrl: string
  /**
   * Collection to search in
   */
  collection: string
  /**
   * Number of results to show per page
   */
  perPage?: number
  /**
   * Debounce delay in milliseconds
   */
  debounceMs?: number
  /**
   * Placeholder text for the input
   */
  placeholder?: string
  /**
   * Custom CSS class for the container
   */
  className?: string
  /**
   * Custom CSS class for the input
   */
  inputClassName?: string
  /**
   * Custom CSS class for the results container
   */
  resultsClassName?: string
  /**
   * Custom CSS class for individual result items
   */
  resultItemClassName?: string
  /**
   * Callback when search results are received
   */
  onResults?: (results: SearchResponse) => void
  /**
   * Callback when search is performed
   */
  onSearch?: (query: string) => void
  /**
   * Callback when a result is clicked
   */
  onResultClick?: (result: SearchResult) => void
  /**
   * Show loading state
   */
  showLoading?: boolean
  /**
   * Show search time
   */
  showSearchTime?: boolean
  /**
   * Show result count
   */
  showResultCount?: boolean
  /**
   * Minimum query length to trigger search
   */
  minQueryLength?: number
  /**
   * Enable suggestions
   */
  enableSuggestions?: boolean
  /**
   * Custom render function for results
   */
  renderResult?: (result: SearchResult, index: number) => React.ReactNode
  /**
   * Custom render function for no results
   */
  renderNoResults?: (query: string) => React.ReactNode
  /**
   * Custom render function for loading state
   */
  renderLoading?: () => React.ReactNode
}

export const HeadlessSearchInput: React.FC<HeadlessSearchInputProps> = ({
  baseUrl,
  collection,
  perPage = 10,
  debounceMs = 300,
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
  resultsClassName = '',
  resultItemClassName = '',
  onResults,
  onSearch,
  onResultClick,
  showLoading = true,
  showSearchTime = true,
  showResultCount = true,
  minQueryLength = 2,
  enableSuggestions = true,
  renderResult,
  renderNoResults,
  renderLoading,
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounced search function
  // Use refs to avoid recreating functions on every render
  const onResultsRef = useRef(onResults)
  const onSearchRef = useRef(onSearch)
  onResultsRef.current = onResults
  onSearchRef.current = onSearch

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setResults(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const searchUrl = `${baseUrl}/api/search/${collection}?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}`
        const response = await fetch(searchUrl)

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`)
        }

        const searchResults: SearchResponse = await response.json()
        setResults(searchResults)
        onResultsRef.current?.(searchResults)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults(null)
      } finally {
        setIsLoading(false)
      }
    },
    [baseUrl, collection, perPage, minQueryLength],
  )

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length >= minQueryLength) {
      debounceRef.current = setTimeout(() => {
        performSearch(query)
        onSearchRef.current?.(query)
      }, debounceMs)
    } else {
      setResults(null)
      setIsLoading(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, debounceMs, minQueryLength, performSearch])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length >= minQueryLength)
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (query.length >= minQueryLength) {
      setIsOpen(true)
    }
  }

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      if (!resultsRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
      }
    }, 150)
  }

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result)
    setIsOpen(false)
    setQuery('')
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !results) return

    const resultItems = resultsRef.current?.querySelectorAll('[data-result-item]')
    if (!resultItems) return

    const currentIndex = Array.from(resultItems).findIndex(
      (item) => item === document.activeElement,
    )

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        const nextIndex = currentIndex < resultItems.length - 1 ? currentIndex + 1 : 0
        ;(resultItems[nextIndex] as HTMLElement)?.focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : resultItems.length - 1
        ;(resultItems[prevIndex] as HTMLElement)?.focus()
        break
      case 'Enter':
        e.preventDefault()
        if (currentIndex >= 0 && resultItems[currentIndex]) {
          ;(resultItems[currentIndex] as HTMLElement)?.click()
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Default render functions
  const defaultRenderResult = (result: SearchResult, index: number) => (
    <div
      key={result.id}
      data-result-item
      tabIndex={0}
      className={`search-result-item ${resultItemClassName}`}
      onClick={() => handleResultClick(result)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleResultClick(result)
        }
      }}
    >
      <div className="search-result-title">{result.title}</div>
      {result.highlight && (
        <div
          className="search-result-highlight"
          dangerouslySetInnerHTML={{ __html: result.highlight }}
        />
      )}
      <div className="search-result-meta">
        Updated: {new Date(result.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )

  const defaultRenderNoResults = (query: string) => (
    <div className="search-no-results">No results found for "{query}"</div>
  )

  const defaultRenderLoading = () => (
    <div className="search-loading">
      <div className="search-loading-spinner"></div>
      Searching...
    </div>
  )

  return (
    <div className={`headless-search-input ${className}`}>
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`search-input ${inputClassName}`}
          autoComplete="off"
        />
        {isLoading && showLoading && (
          <div className="search-input-loading">
            {renderLoading ? renderLoading() : defaultRenderLoading()}
          </div>
        )}
      </div>

      {isOpen && (
        <div ref={resultsRef} className={`search-results ${resultsClassName}`}>
          {error && <div className="search-error">Error: {error}</div>}

          {!error && results && (
            <>
              {showResultCount && (
                <div className="search-results-header">
                  {results.found} result{results.found !== 1 ? 's' : ''} found
                  {showSearchTime && (
                    <span className="search-time">({results.search_time_ms}ms)</span>
                  )}
                </div>
              )}

              {results.hits.length > 0 ? (
                <div className="search-results-list">
                  {results.hits.map((result, index) =>
                    renderResult ? renderResult(result, index) : defaultRenderResult(result, index),
                  )}
                </div>
              ) : renderNoResults ? (
                renderNoResults(query)
              ) : (
                defaultRenderNoResults(query)
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default HeadlessSearchInput
