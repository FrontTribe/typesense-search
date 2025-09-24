'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { BaseSearchInputProps, SearchResponse, SearchResult } from '../lib/types.js'

import styles from './HeadlessSearchInput.module.css'

export interface CollectionMetadata {
  displayName: string
  facetFields: string[]
  icon: string
  searchFields: string[]
  slug: string
}

export interface UnifiedSearchInputProps<T = Record<string, unknown>>
  extends BaseSearchInputProps<T> {
  baseUrl: string
  collections?: string[]
  debounceMs?: number
  /**
   * Include full document data in results
   */
  includeFullDocument?: boolean
  inputClassName?: string
  minQueryLength?: number
  onError?: (error: string) => void
  onResultClick?: (result: SearchResult<T>) => void
  onResults?: (results: SearchResponse<T>) => void
  onSearch?: (query: string) => void
  perPage?: number
  placeholder?: string
  renderLoading?: () => React.ReactNode
  renderNoResults?: (query: string) => React.ReactNode
  renderResult?: (hit: SearchResult<T>, index: number) => React.ReactNode
  resultsClassName?: string
  showLoading?: boolean
  showResultCount?: boolean
  showSearchTime?: boolean
}

const UnifiedSearchInput = <T = Record<string, unknown>,>({
  baseUrl,
  collections: _collections,
  debounceMs = 300,
  inputClassName = '',
  minQueryLength = 2,
  onError,
  onResultClick,
  onResults,
  onSearch,
  perPage = 10,
  placeholder = 'Search...',
  renderLoading,
  renderNoResults,
  renderResult,
  resultsClassName = '',
  showLoading = true,
  showResultCount = true,
  showSearchTime = true,
}: UnifiedSearchInputProps<T>): React.ReactElement => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<null | SearchResponse<T>>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [collectionMetadata, setCollectionMetadata] = useState<CollectionMetadata[]>([])
  const [_isCategorized, _setIsCategorized] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Use refs to avoid recreating functions on every render
  const onResultsRef = useRef(onResults)
  const onSearchRef = useRef(onSearch)
  onResultsRef.current = onResults
  onSearchRef.current = onSearch

  // Fetch collection metadata on mount
  useEffect(() => {
    const fetchCollectionMetadata = async () => {
      try {
        // Ensure baseUrl ends with /api for proper endpoint construction
        const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
        const response = await fetch(`${apiBaseUrl}/search/collections`)

        if (response.ok) {
          const data = await response.json()
          setCollectionMetadata(data.collections || [])
          setIsCategorized(data.categorized || false)
        }
      } catch (err) {
        // Silently handle error
      }
    }

    void fetchCollectionMetadata()
  }, [baseUrl])

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
        // Ensure baseUrl ends with /api for proper endpoint construction
        const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`

        // Use universal search endpoint to search across all collections
        const searchUrl = `${apiBaseUrl}/search?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}`
        const response = await fetch(searchUrl)

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`)
        }

        const searchResults: SearchResponse<T> = await response.json()

        setResults(searchResults)
        onResultsRef.current?.(searchResults)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed'
        setError(errorMessage)
        setResults(null)
        onError?.(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [baseUrl, perPage, minQueryLength, onError],
  )

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length >= minQueryLength) {
      debounceRef.current = setTimeout(() => {
        void performSearch(query)
        onSearchRef.current?.(query)
      }, debounceMs)
    } else {
      setResults(null)
      setIsOpen(false)
      setIsLoading(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, debounceMs, minQueryLength, performSearch])

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length >= minQueryLength)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleResultClick = (result: SearchResult<T>) => {
    onResultClick?.(result)
    setIsOpen(false)
    setQuery('')
  }

  const defaultRenderResult = (hit: SearchResult<T>, index: number) => {
    const result = hit.document as Record<string, unknown>
    const highlight = Object.values(hit.highlight || {}).join(' ... ')

    // Find collection metadata - check both hit.collection and result._collection
    const collectionSlug = hit.collection || result._collection || result.collection || 'unknown'
    const collectionMeta = collectionMetadata.find((c) => c.slug === collectionSlug)

    // Use collection metadata from the hit first, then fallback to collectionMetadata
    const collectionIcon = hit.icon || collectionMeta?.icon || '📄'
    const collectionName =
      hit.displayName ||
      collectionMeta?.displayName ||
      (collectionSlug && collectionSlug !== 'unknown'
        ? collectionSlug.charAt(0).toUpperCase() + collectionSlug.slice(1)
        : 'Unknown Collection')

    return (
      <div
        className={styles.searchResult}
        key={`${String(collectionSlug)}-${String(result.id || index)}`}
        onClick={() => handleResultClick(hit)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleResultClick(hit)
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className={styles.resultHeader}>
          <span className={styles.collectionIcon}>{collectionIcon}</span>
          <span className={styles.collectionName}>{collectionName}</span>
        </div>
        <h3 className={styles.resultTitle}>
          {result.title ||
            result.filename ||
            result.name ||
            `Document ${String(result.id || index)}`}
        </h3>
        {result.shortDescription ? (
          <p className={styles.resultDescription}>{result.shortDescription}</p>
        ) : null}
        {highlight && (
          <div className={styles.resultHighlight} dangerouslySetInnerHTML={{ __html: highlight }} />
        )}
        <div className={styles.resultMeta}>
          <span>ID: {result.id || 'N/A'}</span>
          <span>
            Updated: {result.updatedAt ? new Date(result.updatedAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    )
  }

  const defaultRenderNoResults = (query: string) => (
    <div className={styles.noResults}>
      <div className={styles.noResultsIcon}>
        <span aria-label="search" role="img">
          🔍
        </span>
      </div>
      <div className={styles.noResultsTitle}>No results found for "{query}"</div>
      <p className={styles.noResultsDescription}>
        Try different keywords or check your spelling. Search across all collections.
      </p>
    </div>
  )

  const defaultRenderLoading = () => (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <span>Searching across all collections...</span>
    </div>
  )

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputContainer}>
        <input
          aria-label="Search input"
          autoComplete="off"
          className={`${styles.searchInput} ${inputClassName}`}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          type="text"
          value={query}
        />
        {isLoading && showLoading && (
          <div className={styles.inputLoading}>
            <div className={styles.spinner} />
          </div>
        )}
      </div>

      {isOpen && (
        <div className={`${styles.resultsContainer} ${resultsClassName}`} ref={resultsRef}>
          {isLoading ? (
            renderLoading ? (
              renderLoading()
            ) : (
              defaultRenderLoading()
            )
          ) : error ? (
            <div className={styles.error}>
              <div className={styles.errorIcon}>
                <span aria-label="warning" role="img">
                  ⚠️
                </span>
              </div>
              <div className={styles.errorMessage}>{error}</div>
            </div>
          ) : results && results.hits.length > 0 ? (
            <>
              {showResultCount && (
                <div className={styles.resultCount}>
                  Found {results.found} result{results.found !== 1 ? 's' : ''}
                  {showSearchTime && ` in ${results.search_time_ms}ms`}
                </div>
              )}
              <div className={styles.resultsList}>
                {results.hits.map((hit, index) =>
                  renderResult ? renderResult(hit, index) : defaultRenderResult(hit, index),
                )}
              </div>
            </>
          ) : query.length >= minQueryLength ? (
            renderNoResults ? (
              renderNoResults(query)
            ) : (
              defaultRenderNoResults(query)
            )
          ) : null}
        </div>
      )}
    </div>
  )
}

export default UnifiedSearchInput
export { UnifiedSearchInput }
