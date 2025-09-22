import React, { useState, useRef, useCallback, useEffect } from 'react'
import styles from './HeadlessSearchInput.module.css'

export interface SearchHit {
  document: any
  highlight?: Record<string, string>
  text_match?: number
  collection?: string
  displayName?: string
  icon?: string
}

export interface SearchResponse {
  found: number
  hits: SearchHit[]
  search_time_ms: number
  facet_counts?: any[]
}

export interface CollectionMetadata {
  slug: string
  displayName: string
  icon: string
  searchFields: string[]
  facetFields: string[]
}

export interface UnifiedSearchInputProps {
  baseUrl: string
  collections?: string[]
  placeholder?: string
  debounceMs?: number
  minQueryLength?: number
  perPage?: number
  showLoading?: boolean
  showSearchTime?: boolean
  showResultCount?: boolean
  inputClassName?: string
  resultsClassName?: string
  onSearch?: (query: string) => void
  onResults?: (results: SearchResponse) => void
  onResultClick?: (result: SearchHit) => void
  onError?: (error: string) => void
  renderResult?: (hit: SearchHit, index: number) => React.ReactNode
  renderNoResults?: (query: string) => React.ReactNode
  renderLoading?: () => React.ReactNode
}

const UnifiedSearchInput: React.FC<UnifiedSearchInputProps> = ({
  baseUrl,
  collections,
  placeholder = 'Search...',
  debounceMs = 300,
  minQueryLength = 2,
  perPage = 10,
  showLoading = true,
  showSearchTime = true,
  showResultCount = true,
  inputClassName = '',
  resultsClassName = '',
  onSearch,
  onResults,
  onResultClick,
  onError,
  renderResult,
  renderNoResults,
  renderLoading,
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [collectionMetadata, setCollectionMetadata] = useState<CollectionMetadata[]>([])
  const [isCategorized, setIsCategorized] = useState(false)

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
        } else {
          console.error(
            'Failed to fetch collection metadata:',
            response.status,
            response.statusText,
          )
        }
      } catch (err) {
        console.error('Failed to fetch collection metadata:', err)
      }
    }

    fetchCollectionMetadata()
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

        const searchResults: SearchResponse = await response.json()
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
    [baseUrl, collections, perPage, minQueryLength, collectionMetadata],
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

  const handleResultClick = (result: SearchHit) => {
    onResultClick?.(result)
    setIsOpen(false)
    setQuery('')
  }

  const defaultRenderResult = (hit: SearchHit, index: number) => {
    const result = hit.document
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
        key={`${collectionSlug}-${result.id || index}`}
        className={styles.searchResult}
        onClick={() => handleResultClick(hit)}
      >
        <div className={styles.resultHeader}>
          <span className={styles.collectionIcon}>{collectionIcon}</span>
          <span className={styles.collectionName}>{collectionName}</span>
        </div>
        <h3 className={styles.resultTitle}>
          {result.title || result.filename || result.name || `Document ${result.id || index}`}
        </h3>
        {result.shortDescription && (
          <p className={styles.resultDescription}>{result.shortDescription}</p>
        )}
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
      <div className={styles.noResultsIcon}>🔍</div>
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
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${styles.searchInput} ${inputClassName}`}
          autoComplete="off"
        />
        {isLoading && showLoading && (
          <div className={styles.inputLoading}>
            <div className={styles.spinner} />
          </div>
        )}
      </div>

      {isOpen && (
        <div ref={resultsRef} className={`${styles.resultsContainer} ${resultsClassName}`}>
          {isLoading ? (
            renderLoading ? (
              renderLoading()
            ) : (
              defaultRenderLoading()
            )
          ) : error ? (
            <div className={styles.error}>
              <div className={styles.errorIcon}>⚠️</div>
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
