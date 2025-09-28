'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { BaseSearchInputProps, SearchResponse, SearchResult } from '../lib/types.js'

export interface HeadlessSearchInputProps<T = Record<string, unknown>>
  extends BaseSearchInputProps<T> {
  /**
   * Collection to search in (for single collection search)
   */
  collection?: string
  /**
   * Collections to search in (for multi-collection search)
   */
  collections?: string[]
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

const HeadlessSearchInput = <T = Record<string, unknown>,>({
  baseUrl,
  className = '',
  collection,
  collections,
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
  const collectionsRef = useRef(collections)

  // Note: If neither collection nor collections is provided, the component will search all collections

  // Update collections ref when prop changes
  useEffect(() => {
    collectionsRef.current = collections
  }, [collections])

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
        let searchUrl: string
        let searchResults: SearchResponse<T>

        if (collection) {
          // Single collection search
          searchUrl = `${baseUrl}/api/search/${collection}?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}`
        } else if (collectionsRef.current && collectionsRef.current.length > 0) {
          // Multiple collections specified - use universal search and filter client-side
          searchUrl = `${baseUrl}/api/search?q=${encodeURIComponent(searchQuery)}&per_page=${perPage * 2}`
        } else {
          // No collections specified - use universal search
          searchUrl = `${baseUrl}/api/search?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}`
        }

        const response = await fetch(searchUrl)

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`)
        }

        searchResults = await response.json()

        // Filter results if specific collections were requested
        if (collectionsRef.current && collectionsRef.current.length > 0) {
          const filteredHits =
            searchResults.hits?.filter(
              (hit) => hit.collection && collectionsRef.current!.includes(hit.collection),
            ) || []

          const filteredCollections =
            searchResults.collections?.filter(
              (col) => col.collection && collectionsRef.current!.includes(col.collection),
            ) || []

          searchResults = {
            ...searchResults,
            collections: filteredCollections,
            found: filteredHits.length,
            hits: filteredHits,
          }
        }

        setResults(searchResults)
        onResultsRef.current?.(searchResults)
        onSearchRef.current?.(searchQuery, searchResults)
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
        void onSearchRef.current?.(
          query,
          results || {
            found: 0,
            hits: [],
            page: 1,
            request_params: { per_page: 10, q: query },
            search_cutoff: false,
            search_time_ms: 0,
          },
        )
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
    if (!isOpen || !results) {
      return
    }

    const resultItems = resultsRef.current?.querySelectorAll('[data-result-item]')
    if (!resultItems) {
      return
    }

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
  const defaultRenderResult = (result: SearchResult, _index: number) => {
    // Calculate relative percentage based on the highest score in current results
    const maxScore = results?.hits?.reduce((max, hit) => Math.max(max, hit.text_match || 0), 0) || 1
    const relativePercentage = Math.round(((result.text_match || 0) / maxScore) * 100)

    return (
      <div
        className={`search-result-item group relative cursor-pointer px-4 py-3 hover:bg-gray-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${resultItemClassName}`}
        data-result-item
        key={result.document?.id || result.id || _index}
        onClick={() => handleResultClick(result)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleResultClick(result)
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-start space-x-3">
          {/* Collection Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-medium">
              {result.collection?.charAt(0).toUpperCase() || '📄'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {result.document?.title || result.document?.name || result.title || 'Untitled'}
              </h3>
              {result.text_match && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {relativePercentage}%
                </span>
              )}
            </div>

            {(result.highlight?.title?.snippet || result.highlight?.content?.snippet) && (
              <div
                className="mt-1 text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html:
                    result.highlight?.title?.snippet || result.highlight?.content?.snippet || '',
                }}
              />
            )}

            <div className="mt-2 flex items-center text-xs text-gray-500 space-x-3">
              <span className="inline-flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    clipRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    fillRule="evenodd"
                  />
                </svg>
                {result.collection}
              </span>
              {(result.document?.updatedAt || result.updatedAt) && (
                <span className="inline-flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      fillRule="evenodd"
                    />
                  </svg>
                  {new Date(result.document?.updatedAt || result.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Arrow Icon */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  const defaultRenderNoResults = (query: string) => (
    <div className={`search-no-results px-4 py-8 text-center ${noResultsClassName}`}>
      <div className="flex flex-col items-center">
        <svg
          className="w-12 h-12 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
          />
        </svg>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No results found</h3>
        <p className="text-sm text-gray-500">Try searching for something else</p>
      </div>
    </div>
  )

  const defaultRenderLoading = () => (
    <div className={`search-loading px-4 py-6 ${loadingClassName}`}>
      <div className="flex items-center justify-center space-x-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
        <span className="text-sm text-gray-600">Searching...</span>
      </div>
    </div>
  )

  const defaultRenderError = (error: string) => (
    <div className={`search-error px-4 py-6 ${errorClassName}`}>
      <div className="flex items-center space-x-3 text-red-600">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            clipRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            fillRule="evenodd"
          />
        </svg>
        <div>
          <h3 className="text-sm font-medium">Search Error</h3>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    </div>
  )

  const defaultRenderResultsHeader = (found: number, searchTime: number) => (
    <div
      className={`search-results-header px-4 py-3 bg-gray-50 border-b border-gray-200 ${resultsHeaderClassName}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              clipRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              fillRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {found} result{found !== 1 ? 's' : ''} found
          </span>
        </div>
        {showSearchTime && (
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {searchTime}ms
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className={`headless-search-input relative ${className}`}>
      <div className={`search-input-container relative ${inputWrapperClassName}`}>
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
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" data-testid="loading-spinner"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div
          className={`search-results absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200 ${resultsClassName}`}
          ref={resultsRef}
        >
          {error && (renderError ? renderError(error) : defaultRenderError(error))}

          {!error && results && (
            <>
              {showResultCount &&
                (renderResultsHeader
                  ? renderResultsHeader(results.found, results.search_time_ms)
                  : defaultRenderResultsHeader(results.found, results.search_time_ms))}

              {results.hits.length > 0 ? (
                <div className={`search-results-list ${resultsListClassName}`}>
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
export { HeadlessSearchInput }
