# Performance

Optimize your Typesense Search Plugin for maximum performance and scalability.

## Built-in Caching

The plugin includes automatic caching for search results:

### Cache Configuration

```typescript
// Configure cache settings in plugin options
typesenseSearch({
  settings: {
    cache: {
      maxSize: 1000, // Maximum number of cached entries
      ttl: 300000, // Time-to-live in milliseconds (5 minutes)
    },
  },
  // ... other config
})
```

### Cache Behavior

- **Automatic**: All search results are automatically cached
- **TTL**: 5 minutes by default (300,000ms)
- **Max Size**: 1000 entries by default
- **Cleanup**: Expired entries are cleaned up every 10 minutes
- **Key Generation**: Based on query, collection, and parameters

### Cache Statistics

Monitor cache performance via the health check endpoint:

```bash
curl "http://localhost:3000/api/search/health"
```

Response includes cache statistics:

```json
{
  "cache": {
    "maxSize": 1000,
    "size": 45,
    "hitRate": 0.85
  }
}
```

## Search Optimization

### Search Parameters

The plugin supports these performance-related search parameters:

```typescript
// Available search parameters
interface SearchParams {
  q: string // Search query (required)
  page?: number // Page number (1-based, default: 1)
  per_page?: number // Results per page (1-250, default: 10)
  sort_by?: string // Sort field and direction
  num_typos?: number // Typo tolerance (0-4, default: 0)
  snippet_threshold?: number // Snippet threshold (0-100, default: 30)
  typo_tokens_threshold?: number // Typo tokens threshold (default: 1)
  facets?: string[] // Facet fields
  filters?: Record<string, any> // Filter conditions
  highlight_fields?: string[] // Fields to highlight
}
```

### Collection Configuration

Optimize collections for better performance:

```typescript
collections: {
  posts: {
    enabled: true,
    searchFields: ['title', 'content', 'excerpt'], // Only essential fields
    facetFields: ['category', 'status'],           // Limit facets
    displayName: 'Blog Posts',
    icon: '📝'
  }
}
```

### Typesense Configuration

Optimize Typesense connection settings:

```typescript
typesense: {
  apiKey: process.env.TYPESENSE_API_KEY,
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: parseInt(process.env.TYPESENSE_PORT),
      protocol: 'https'
    }
  ],
  connectionTimeoutSeconds: 10,  // Connection timeout
  numRetries: 3,                // Retry attempts
  retryIntervalSeconds: 1       // Retry interval
}
```

## React Component Performance

### Debouncing

Use debouncing to reduce API calls:

```tsx
<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  debounceMs={300} // 300ms debounce
  minQueryLength={2} // Minimum query length
  perPage={10} // Limit results per page
/>
```

### Memoization

Memoize expensive operations:

```tsx
import React, { memo, useCallback, useMemo } from 'react'
import { UnifiedSearchInput } from '@fronttribe/typesense-search'

// Memoize result component
const SearchResult = memo(({ hit }: { hit: SearchResult }) => (
  <div className="result">
    <h3>{hit.document.title}</h3>
    <p>{hit.document.content}</p>
  </div>
))

// Memoize search handler
const SearchPage = () => {
  const handleResultClick = useCallback((result: SearchResult) => {
    console.log('Selected:', result.document)
  }, [])

  const searchConfig = useMemo(
    () => ({
      baseUrl: 'http://localhost:3000',
      debounceMs: 300,
      minQueryLength: 2,
      perPage: 10,
    }),
    [],
  )

  return (
    <UnifiedSearchInput
      {...searchConfig}
      onResultClick={handleResultClick}
      renderResult={(hit, index) => <SearchResult key={index} hit={hit} />}
    />
  )
}
```

### Custom Rendering

Optimize rendering with custom components:

```tsx
<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  renderResult={(hit, index) => (
    <div key={hit.id} className="result">
      <h3>{hit.document.title}</h3>
      <p>{hit.document.excerpt}</p>
    </div>
  )}
  renderLoading={() => <div>Searching...</div>}
  renderNoResults={(query) => <div>No results for "{query}"</div>}
/>
```

## Network Optimization

### Request Optimization

The plugin automatically optimizes requests:

- **Parallel Search**: Universal search queries all collections in parallel
- **Caching**: Results are cached to avoid duplicate requests
- **Parameter Validation**: Invalid parameters are rejected early
- **Connection Pooling**: Typesense client handles connection pooling

### Pagination

Use pagination for large result sets:

```bash
# First page
curl "http://localhost:3000/api/search?q=typesense&page=1&per_page=20"

# Next page
curl "http://localhost:3000/api/search?q=typesense&page=2&per_page=20"
```

## Monitoring Performance

### Health Check

Monitor plugin health and performance:

```bash
# Basic health check
curl "http://localhost:3000/api/search/health"

# Detailed health check
curl "http://localhost:3000/api/search/health/detailed"
```

### Performance Metrics

Track search performance in your application:

```tsx
<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  onResults={(results) => {
    // Track search performance
    console.log(`Search completed in ${results.search_time_ms}ms`)
    console.log(`Found ${results.found} results`)

    // Send to analytics
    analytics.track('search_completed', {
      query: results.request_params.q,
      searchTime: results.search_time_ms,
      resultCount: results.found,
    })
  }}
  onError={(error) => {
    // Track search errors
    console.error('Search error:', error)
    analytics.track('search_error', { error })
  }}
/>
```

## Scaling Considerations

### Multiple Typesense Nodes

Configure multiple Typesense nodes for high availability:

```typescript
typesense: {
  apiKey: process.env.TYPESENSE_API_KEY,
  nodes: [
    { host: 'typesense-1.example.com', port: 443, protocol: 'https' },
    { host: 'typesense-2.example.com', port: 443, protocol: 'https' },
    { host: 'typesense-3.example.com', port: 443, protocol: 'https' }
  ],
  connectionTimeoutSeconds: 5,
  numRetries: 3
}
```

### Load Balancing

The Typesense client automatically handles load balancing across multiple nodes.

## Best Practices

### 1. Optimize Search Fields

```typescript
// Use only essential search fields
searchFields: ['title', 'content'] // Not all fields

// Limit facet fields
facetFields: ['category', 'status'] // Not too many
```

### 2. Use Pagination

```typescript
// Implement pagination for large result sets
const searchWithPagination = async (query: string, page: number = 1) => {
  return await fetch(`/api/search?q=${query}&page=${page}&per_page=20`)
}
```

### 3. Monitor Performance

```typescript
// Regular performance monitoring
setInterval(() => {
  fetch('/api/search/health')
    .then((res) => res.json())
    .then((data) => {
      console.log('Cache hit rate:', data.cache?.hitRate)
      console.log('Cache size:', data.cache?.size)
    })
}, 60000) // Every minute
```

### 4. Optimize Typesense Settings

```typescript
// Use appropriate Typesense settings
const searchParameters = {
  num_typos: 1, // Allow some typos for better UX
  snippet_threshold: 30, // Reasonable snippet length
  typo_tokens_threshold: 1, // Token threshold
  per_page: 20, // Reasonable page size
}
```

### 5. Cache Management

```typescript
// Clear cache when needed (via health endpoint)
// The plugin automatically manages cache cleanup
// No manual cache management needed
```

## Troubleshooting Performance Issues

### Slow Search Queries

1. **Check Typesense Performance**: Monitor Typesense server metrics
2. **Optimize Search Fields**: Reduce the number of search fields
3. **Use Pagination**: Limit results per page
4. **Check Cache Hit Rate**: Ensure caching is working effectively

### High Memory Usage

1. **Reduce Cache Size**: Lower `maxSize` in cache settings
2. **Reduce TTL**: Lower cache TTL to free memory faster
3. **Monitor Cache Stats**: Use health check to monitor cache usage

### Connection Issues

1. **Check Typesense Nodes**: Ensure all nodes are accessible
2. **Adjust Timeouts**: Increase `connectionTimeoutSeconds` if needed
3. **Check Retry Settings**: Adjust `numRetries` and `retryIntervalSeconds`

## Next Steps

- [Troubleshooting](/guide/troubleshooting) - Fix performance issues
- [API Reference](/api/search) - Advanced search features
- [Customization](/guide/customization) - Customize for your needs
