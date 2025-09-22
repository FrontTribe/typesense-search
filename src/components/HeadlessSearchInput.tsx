'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { SearchResult, SearchResponse, BaseSearchInputProps } from '../lib/types.js'

export interface HeadlessSearchInputProps<T = any> extends BaseSearchInputProps<T> {
  /**
   * Collection to search in
   */
  collection: string
  /**
   * Number of results to show per page
   */
  perPage?: number
  /**
   * Custom CSS class for the results container
   */
  resultsClassName?: string
  /**
   * Custom CSS class for individual result items
   */
  resultItemClassName?: string
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
   * Enable suggestions
   */
  enableSuggestions?: boolean
  /**
   * Custom render function for results
   */
  renderResult?: (result: SearchResult<T>, index: number) => React.ReactNode
  /**
   * Custom render function for no results
   */
  renderNoResults?: (query: string) => React.ReactNode
  /**
   * Custom render function for loading state
   */
  renderLoading?: () => React.ReactNode
  /**
   * Custom render function for error state
   */
  renderError?: (error: string) => React.ReactNode
  /**
   * Custom render function for results header
   */
  renderResultsHeader?: (found: number, searchTime: number) => React.ReactNode
  /**
   * Custom input element (for complete control)
   */
  renderInput?: (props: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onFocus: () => void
    onBlur: (e: React.FocusEvent) => void
    onKeyDown: (e: React.KeyboardEvent) => void
    placeholder: string
    className: string
    ref: React.RefObject<HTMLInputElement | null>
  }) => React.ReactNode
}

const HeadlessSearchInput = <T = any>({
  baseUrl,
  collection,
  perPage = 10,
  debounceMs = 300,
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
  resultsClassName = '',
  resultItemClassName = '',
  inputWrapperClassName = '',
  resultsListClassName = '',
  resultsHeaderClassName = '',
  loadingClassName = '',
  errorClassName = '',
  noResultsClassName = '',
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
  renderError,
  renderResultsHeader,
  renderInput,
}: HeadlessSearchInputProps<T>): React.ReactElement => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse<T> | null>(null)
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

        const searchResults: SearchResponse<T> = await response.json()
        
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
        onSearchRef.current?.(query, results || { found: 0, hits: [], page: 1, search_time_ms: 0, request_params: { q: query, per_page: 10 }, search_cutoff: false })
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
  const handleResultClick = (result: SearchResult<T>) => {
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
        Updated: {result.updatedAt ? new Date(result.updatedAt).toLocaleDateString() : 'Unknown'}
        {result.text_match && (
          <span className="search-result-match">({result.text_match}% match)</span>
        )}
      </div>
    </div>
  )

  const defaultRenderNoResults = (query: string) => (
    <div className={`search-no-results ${noResultsClassName}`}>
      No results found for "{query}"
    </div>
  )

  const defaultRenderLoading = () => (
    <div className={`search-loading ${loadingClassName}`}>
      <div className="search-loading-spinner"></div>
      Searching...
    </div>
  )

  const defaultRenderError = (error: string) => (
    <div className={`search-error ${errorClassName}`}>
      Error: {error}
    </div>
  )

  const defaultRenderResultsHeader = (found: number, searchTime: number) => (
    <div className={`search-results-header ${resultsHeaderClassName}`}>
      {found} result{found !== 1 ? 's' : ''} found
      {showSearchTime && (
        <span className="search-time">({searchTime}ms)</span>
      )}
    </div>
  )

  return (
    <div className={`headless-search-input ${className}`}>
      <div className={`search-input-container ${inputWrapperClassName}`}>
        {renderInput ? (
          renderInput({
            value: query,
            onChange: handleInputChange,
            onFocus: handleInputFocus,
            onBlur: handleInputBlur,
            onKeyDown: handleKeyDown,
            placeholder,
            className: `search-input ${inputClassName}`,
            ref: inputRef,
          })
        ) : (
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
        )}
        {isLoading && showLoading && (
          <div className="search-input-loading">
            {renderLoading ? renderLoading() : defaultRenderLoading()}
          </div>
        )}
      </div>

      {isOpen && (
        <div ref={resultsRef} className={`search-results ${resultsClassName}`}>
          {error && (
            renderError ? renderError(error) : defaultRenderError(error)
          )}

          {!error && results && (
            <>
              {showResultCount && (
                renderResultsHeader ? 
                  renderResultsHeader(results.found, results.search_time_ms) : 
                  defaultRenderResultsHeader(results.found, results.search_time_ms)
              )}

              {results.hits.length > 0 ? (
                <div className={`search-results-list ${resultsListClassName}`}>
                  {results.hits.map((result, index) =>
                    renderResult ? renderResult(result, index) : defaultRenderResult(result, index),
                  )}
                </div>
              ) : (
                renderNoResults ? 
                  renderNoResults(query) : 
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
export { HeadlessSearchInput }
