import React, { useState, useRef, useCallback, useEffect } from 'react'
import styles from './HeadlessSearchInput.module.css'

export interface SearchHit {
  document: any
  highlight?: Record<string, string>
  text_match?: number
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
        const response = await fetch(`${baseUrl}/api/search/collections`)

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
        // Use collection metadata if available, otherwise fall back to collections prop
        const collectionsToSearch =
          collectionMetadata.length > 0 ? collectionMetadata.map((c) => c.slug) : collections || []

        // Search all collections in parallel
        const searchPromises = collectionsToSearch.map(async (collection) => {
          const searchUrl = `${baseUrl}/api/search/${collection}?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}`
          const response = await fetch(searchUrl)

          if (!response.ok) {
            throw new Error(
              `Search failed for ${collection}: ${response.status} ${response.statusText}`,
            )
          }

          const searchResults: SearchResponse = await response.json()
          return {
            collection,
            results: searchResults,
          }
        })

        const searchResults = await Promise.all(searchPromises)

        // Combine results from all collections
        const combinedHits: SearchHit[] = []
        let totalFound = 0
        let totalSearchTime = 0

        searchResults.forEach(({ collection, results }) => {
          if (results.hits) {
            results.hits.forEach((hit) => {
              combinedHits.push({
                ...hit,
                document: {
                  ...hit.document,
                  _collection: collection,
                },
              })
            })
          }
          totalFound += results.found || 0
          totalSearchTime += results.search_time_ms || 0
        })

        const combinedResults: SearchResponse = {
          found: totalFound,
          hits: combinedHits,
          search_time_ms: totalSearchTime,
        }

        setResults(combinedResults)
        onResultsRef.current?.(combinedResults)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults(null)
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

    // Find collection metadata
    const collectionMeta = collectionMetadata.find((c) => c.slug === result._collection)
    const collectionIcon = collectionMeta?.icon || '📄'
    const collectionName =
      collectionMeta?.displayName ||
      result._collection.charAt(0).toUpperCase() + result._collection.slice(1)

    return (
      <div
        key={`${result._collection}-${result.id || index}`}
        className={styles.searchResult}
        onClick={() => handleResultClick(hit)}
      >
        <div className={styles.resultHeader}>
          <span className={styles.collectionIcon}>{collectionIcon}</span>
          <span className={styles.collectionName}>{collectionName}</span>
        </div>
        <h3 className={styles.resultTitle}>
          {result.title || result.filename || `Document ${result.id}`}
        </h3>
        {result.shortDescription && (
          <p className={styles.resultDescription}>{result.shortDescription}</p>
        )}
        {highlight && (
          <div className={styles.resultHighlight} dangerouslySetInnerHTML={{ __html: highlight }} />
        )}
        <div className={styles.resultMeta}>
          <span>ID: {result.id}</span>
          <span>Updated: {new Date(result.updatedAt).toLocaleDateString()}</span>
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
