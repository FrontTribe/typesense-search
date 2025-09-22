// Export all search components
export { default as HeadlessSearchInput } from './HeadlessSearchInput.js'
export type {
  SearchResult,
  SearchResponse,
  HeadlessSearchInputProps,
} from './HeadlessSearchInput.js'

export { default as UnifiedSearchInput } from './UnifiedSearchInput.js'
export type {
  SearchHit,
  SearchResponse as UnifiedSearchResponse,
  CollectionMetadata,
  UnifiedSearchInputProps,
} from './UnifiedSearchInput.js'

// Export existing admin components
export { BeforeDashboardClient } from './BeforeDashboardClient.js'
export { BeforeDashboardServer } from './BeforeDashboardServer.js'
