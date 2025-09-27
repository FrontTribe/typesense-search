'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { BaseSearchInputProps, SearchResponse, SearchResult } from '../lib/types.js'

export interface HeadlessSearchInputProps<T = Record<string, unknown>> extends BaseSearchInputProps<T> {
  /**
   * Collection to search in
   */
  collection: string
  /**
   * Enable suggestions
   */
  enableSuggestions?: boolean
  /**
   * Number of results to show per page
   */
  perPage?: number
  /**
   * Custom render function for error state
   */
  renderError?: (error: string) => React.ReactNode
  /**
   * Custom input element (for complete control)
   */
  renderInput?: (props: {
    className: string
    onBlur: (e: React.FocusEvent) => void
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onFocus: () => void
    onKeyDown: (e: React.KeyboardEvent) => void
    placeholder: string
    ref: React.RefObject<HTMLInputElement | null>
    value: string
  }) => React.ReactNode
  /**
   * Custom render function for loading state
   */
  renderLoading?: () => React.ReactNode
  /**
   * Custom render function for no results
   */
  renderNoResults?: (query: string) => React.ReactNode
  /**
   * Custom render function for results
   */
  renderResult?: (result: SearchResult<T>, index: number) => React.ReactNode
  /**
   * Custom render function for results header
   */
  renderResultsHeader?: (found: number, searchTime: number) => React.ReactNode
  /**
   * Custom CSS class for individual result items
   */
  resultItemClassName?: string
  /**
   * Custom CSS class for the results container
   */
  resultsClassName?: string
  /**
   * Show loading state
   */
  showLoading?: boolean
  /**
   * Show result count
   */
  showResultCount?: boolean
  /**
   * Show search time
   */
  showSearchTime?: boolean
}

const HeadlessSearchInput = <T = Record<string, unknown>>({
  baseUrl,
  className = '',
  collection,
  debounceMs = 300,
  enableSuggestions: _enableSuggestions = true,
  errorClassName = '',
  inputClassName = '',
  inputWrapperClassName = '',
  loadingClassName = '',
  minQueryLength = 2,
  noResultsClassName = '',
  onResultClick,
  onResults,
  onSearch,
  perPage = 10,
  placeholder = 'Search...',
  renderError,
  renderInput,
  renderLoading,
  renderNoResults,
  renderResult,
  renderResultsHeader,
  resultItemClassName = '',
  resultsClassName = '',
  resultsHeaderClassName = '',
  resultsListClassName = '',
  showLoading = true,
  showResultCount = true,
  showSearchTime = true,
}: HeadlessSearchInputProps<T>): React.ReactElement => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<null | SearchResponse<T>>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<null | string>(null)

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
        void performSearch(query)
        void onSearchRef.current?.(query, results || { found: 0, hits: [], page: 1, request_params: { per_page: 10, q: query }, search_cutoff: false, search_time_ms: 0 })
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const handleInputBlur = (_e: React.FocusEvent) => {
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
    if (!isOpen || !results) {return}

    const resultItems = resultsRef.current?.querySelectorAll('[data-result-item]')
    if (!resultItems) {return}

    const currentIndex = Array.from(resultItems).findIndex(
      (item) => item === document.activeElement,
    )

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const nextIndex = currentIndex < resultItems.length - 1 ? currentIndex + 1 : 0
        ;(resultItems[nextIndex] as HTMLElement)?.focus()
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : resultItems.length - 1
        ;(resultItems[prevIndex] as HTMLElement)?.focus()
        break
      }
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
  const defaultRenderResult = (result: SearchResult, _index: number) => (
    <div
      className={`search-result-item ${resultItemClassName}`}
      data-result-item
      key={result.id}
      onClick={() => handleResultClick(result)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleResultClick(result)
        }
      }}
      role='button'
      tabIndex={0}
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
        {result.text_match ? (
          <span className="search-result-match">({result.text_match}% match)</span>
        ) : null}
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
            className: `search-input ${inputClassName}`,
            onBlur: handleInputBlur,
            onChange: handleInputChange,
            onFocus: handleInputFocus,
            onKeyDown: handleKeyDown,
            placeholder,
            ref: inputRef,
            value: query,
          })
        ) : (
          <input
            aria-label="Search input"
            autoComplete="off"
            className={`search-input ${inputClassName}`}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={inputRef}
            type="text"
            value={query}
          />
        )}
        {isLoading && showLoading && (
          <div className="search-input-loading">
            {renderLoading ? renderLoading() : defaultRenderLoading()}
          </div>
        )}
      </div>

      {isOpen && (
        <div className={`search-results ${resultsClassName}`} ref={resultsRef}>
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
