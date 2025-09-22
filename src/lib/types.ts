/**
 * Generic types for better type safety across the plugin
 */

// Base document interface that all collections should extend
export interface BaseDocument {
  id: string
  slug?: string
  createdAt: string | Date
  updatedAt: string | Date
  _status?: 'draft' | 'published'
}

// Generic search result interface
export interface SearchResult<T = any> {
  id: string
  document: T
  highlight?: Record<string, string>
  text_match?: number
  text_match_info?: {
    best_field_score: string
    best_field_weight: number
    fields_matched: number
    score: string
    tokens_matched: number
  }
  collection?: string
  displayName?: string
  icon?: string
  // Additional fields for display
  title?: string
  content?: string
  updatedAt?: string
}

// Generic search response interface
export interface SearchResponse<T = any> {
  found: number
  hits: SearchResult<T>[]
  page: number
  request_params: {
    q: string
    per_page: number
    page?: number
    sort_by?: string
  }
  search_cutoff: boolean
  search_time_ms: number
  collections?: Array<{
    collection: string
    displayName: string
    icon: string
    found: number
    error?: string
  }>
}

// Generic suggest result interface
export interface SuggestResult<T = any> {
  document: T
  highlight?: Record<string, string>
  text_match?: number
  collection?: string
  displayName?: string
  icon?: string
}

// Generic suggest response interface
export interface SuggestResponse<T = any> {
  found: number
  hits: SuggestResult<T>[]
  page: number
  request_params: {
    q: string
    per_page: number
  }
  search_cutoff: boolean
  search_time_ms: number
}

// Generic collection configuration
export interface CollectionConfig<T = any> {
  enabled?: boolean
  displayName?: string
  icon?: string
  searchFields?: Array<keyof T | string>
  facetFields?: Array<keyof T | string>
  // Custom field mapping for complex nested structures
  fieldMapping?: Record<string, string>
}

// Generic plugin configuration
export interface TypesenseSearchConfig<T = Record<string, any>> {
  typesense: {
    nodes: Array<{
      host: string
      port: number
      protocol: 'http' | 'https'
    }>
    apiKey: string
    connectionTimeoutSeconds?: number
    numRetries?: number
    retryIntervalSeconds?: number
  }
  collections: Record<string, CollectionConfig<T>>
  settings?: {
    categorized?: boolean
    cache?: {
      ttl?: number
      maxSize?: number
    }
  }
}

// Generic search parameters
export interface SearchParams {
  q: string
  page?: number
  per_page?: number
  sort_by?: string
  filters?: Record<string, any>
  facets?: string[]
  highlight_fields?: string[]
  snippet_threshold?: number
  num_typos?: number
  typo_tokens_threshold?: number
}

// Generic component props for search inputs
export interface BaseSearchInputProps<T = any> {
  baseUrl: string
  collection?: string
  placeholder?: string
  debounceMs?: number
  minQueryLength?: number
  maxResults?: number
  onResultClick?: (result: SearchResult<T>) => void
  onSearch?: (query: string, results: SearchResponse<T>) => void
  onError?: (error: string) => void
  onLoading?: (loading: boolean) => void
  onResults?: (results: SearchResponse<T>) => void
  className?: string
  // Styling props
  inputClassName?: string
  inputWrapperClassName?: string
  resultsListClassName?: string
  resultsHeaderClassName?: string
  loadingClassName?: string
  errorClassName?: string
  noResultsClassName?: string
}

// Generic cache entry
export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
}

// Generic cache options
export interface CacheOptions {
  ttl?: number
  maxSize?: number
}

// Generic health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  typesense?: {
    ok: boolean
    version?: string
  }
  collections?: string[]
  lastSync?: number
  cache?: {
    size: number
    maxSize: number
  }
  error?: string
}

// Generic error response
export interface ErrorResponse {
  error: string
  details?: string
  code?: string
  timestamp?: string
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ErrorResponse
  meta?: {
    timestamp: string
    requestId?: string
    cached?: boolean
  }
}
