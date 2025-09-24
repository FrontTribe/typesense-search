// Export types from lib
export type {
  BaseSearchInputProps,
  HealthCheckResponse,
  SearchResponse,
  SearchResult,
  TypesenseSearchConfig,
} from '../lib/types.js'
// Export existing admin components
export { BeforeDashboardClient } from './BeforeDashboardClient.js'

export { BeforeDashboardServer } from './BeforeDashboardServer.js'
// Export all search components
export { default as HeadlessSearchInput } from './HeadlessSearchInput.js'

export type {
  HeadlessSearchInputProps,
} from './HeadlessSearchInput.js'

export { default as UnifiedSearchInput } from './UnifiedSearchInput.js'
export type {
  CollectionMetadata,
  UnifiedSearchInputProps,
} from './UnifiedSearchInput.js'
