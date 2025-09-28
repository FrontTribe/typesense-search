# Customization

Learn how to customize the Typesense Search Plugin to match your needs and design.

## Component Customization

### Custom Styling

Override the default styles with CSS:

```css
/* Custom search input */
.headless-search-input input {
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 18px;
  background: #f8fafc;
}

.headless-search-input input:focus {
  border-color: #5a67d8;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Custom results */
.headless-search-input .search-result {
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.headless-search-input .search-result:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
```

### Custom Result Rendering

Create completely custom result displays:

```tsx
// Single collection with custom rendering
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  renderResult={(hit, index) => (
    <div key={index} className="custom-result">
      <h3>{hit.document.title}</h3>
      <p>{hit.document.content}</p>
      <span className="collection-badge">{hit.collection}</span>
    </div>
  )}
/>

// Multi-collection with custom rendering
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collections={['posts', 'products']}
  renderResult={(hit, index) => (
    <div key={index} className="custom-result">
      <div className="result-header">
        <span className="collection-badge">
          {hit.icon} {hit.displayName || hit.collection}
        </span>
        <span className="score">{Math.round((hit.text_match || 0) * 100)}%</span>
      </div>

      <h3 className="result-title">
        {hit.document.title || hit.document.filename || hit.document.name}
      </h3>

      <p className="result-excerpt">
        {hit.document.shortDescription || hit.document.content?.substring(0, 150)}...
      </p>

      {hit.highlight && (
        <div className="highlights">
          {Object.entries(hit.highlight).map(([field, highlight]) => (
            <div key={field} className="highlight-field">
              <strong>{field}:</strong>
              <span
                dangerouslySetInnerHTML={{
                  __html: highlight,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="result-meta">
        <span className="date">
          {hit.document.updatedAt ? new Date(hit.document.updatedAt).toLocaleDateString() : 'N/A'}
        </span>
        <span className="id">ID: {hit.document.id}</span>
      </div>
    </div>
  )}
/>
```

### Custom Loading and Error States

```tsx
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  renderLoading={() => (
    <div className="loading-state">
      <div className="spinner"></div>
      <span>Searching across all collections...</span>
    </div>
  )}
  renderNoResults={(query) => (
    <div className="no-results">
      <div className="no-results-icon">🔍</div>
      <h3>No results for "{query}"</h3>
      <p>Try different keywords or check your spelling.</p>
    </div>
  )}
  onError={(error) => (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3>Search Error</h3>
      <p>Something went wrong. Please try again.</p>
    </div>
  )}
/>
```

### HeadlessSearchInput Customization

For complete control over rendering, use the HeadlessSearchInput:

```tsx
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  renderInput={(props) => (
    <div className="search-input-wrapper">
      <input {...props} />
      <span className="search-icon">🔍</span>
    </div>
  )}
  renderResult={(result, index) => (
    <div
      key={result.id}
      className="custom-result-item"
      data-result-item
      onClick={() => console.log('Clicked:', result)}
    >
      <h3>{result.title}</h3>
      <p>{result.document.content}</p>
    </div>
  )}
  renderResultsHeader={(found, searchTime) => (
    <div className="results-header">
      Found {found} results in {searchTime}ms
    </div>
  )}
/>
```

## Search Behavior Customization

### Search Parameters

The plugin supports these search parameters:

- `q` - Search query (required)
- `page` - Page number (1-based, default: 1)
- `per_page` - Results per page (1-250, default: 10)
- `sort_by` - Sort field and direction (optional)

### Collection Configuration

Customize search behavior per collection:

```typescript
collections: {
  posts: {
    enabled: true,
    displayName: 'Blog Posts',
    searchFields: ['title', 'content', 'excerpt'],
    facetFields: ['category', 'status', 'author'],
    icon: '📝',
    sortFields: ['createdAt', 'updatedAt', 'title']
  }
}
```

### Advanced Search

Use the POST endpoint for custom Typesense parameters:

```bash
curl -X POST "http://localhost:3000/api/search/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "q": "typesense",
    "query_by": "title,content",
    "filter_by": "status:published",
    "sort_by": "createdAt:desc",
    "highlight_full_fields": "title,content",
    "num_typos": 1,
    "snippet_threshold": 30
  }'
```

## Performance Optimization

### Debouncing

```tsx
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  debounceMs={500} // Increase for slower networks
  minQueryLength={3} // Reduce API calls
/>
```

### Result Limiting

```tsx
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  perPage={5} // Limit results for faster rendering
/>
```

### Caching

The plugin includes built-in caching:

- **Cache Key**: Based on query, collection, and parameters
- **TTL**: 5 minutes (300,000ms) by default
- **Max Size**: 1000 entries by default
- **Hit Rate**: Available in health check responses

## Theme Integration

The plugin includes a comprehensive theme system with 5 pre-built themes and unlimited customization options.

### Quick Theme Usage

```tsx
// Use pre-built themes
<HeadlessSearchInput theme="modern" />      // Clean and professional
<HeadlessSearchInput theme="minimal" />     // Flat design
<HeadlessSearchInput theme="elegant" />     // Sophisticated with gradients
<HeadlessSearchInput theme="dark" />        // Perfect for dark mode
<HeadlessSearchInput theme="colorful" />    // Vibrant and modern

// Custom theme configuration
<HeadlessSearchInput
  theme={{
    theme: 'modern',
    colors: {
      inputBorderFocus: '#10b981',
      inputBackground: '#f0fdf4',
    },
    enableAnimations: true,
    enableShadows: true,
  }}
/>
```

📖 **[Complete Theme System Documentation](/themes/theme-system)** - Learn about all theme options, custom configurations, performance settings, and advanced features.

### Legacy CSS Styling (Deprecated)

> **Note**: The new theme system replaces the need for custom CSS. Use the theme system for better maintainability and consistency.

```css
/* Dark mode styles - DEPRECATED: Use theme="dark" instead */
@media (prefers-color-scheme: dark) {
  .headless-search-input input {
    background: #1a202c;
    color: #e2e8f0;
    border-color: #4a5568;
  }

  .headless-search-input .search-results {
    background: #2d3748;
    border-color: #4a5568;
  }

  .headless-search-input .search-result {
    color: #e2e8f0;
  }

  .headless-search-input .search-result:hover {
    background: #4a5568;
  }
}
```

### Brand Colors

```css
:root {
  --search-primary: #667eea;
  --search-primary-hover: #5a67d8;
  --search-background: #f8fafc;
  --search-border: #e2e8f0;
  --search-text: #2d3748;
}

.headless-search-input input {
  border-color: var(--search-border);
  background: var(--search-background);
  color: var(--search-text);
}

.headless-search-input input:focus {
  border-color: var(--search-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
```

## Event Handling

### Search Events

```tsx
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  onSearch={(query) => {
    console.log('Searching for:', query)
    // Track search analytics
  }}
  onResults={(results) => {
    console.log(`Found ${results.found} results in ${results.search_time_ms}ms`)
    // Track search completion
  }}
  onResultClick={(result) => {
    console.log('Result clicked:', result.document.title)
    // Navigate to result page
  }}
  onError={(error) => {
    console.error('Search error:', error)
    // Show user-friendly error message
  }}
/>
```

### Custom Analytics

```tsx
const trackSearchEvent = (event: string, data: any) => {
  // Send to your analytics service
  analytics.track(event, {
    ...data,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
  })
}

;<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  onSearch={(query) => {
    trackSearchEvent('search_initiated', { query })
  }}
  onResultClick={(result) => {
    trackSearchEvent('search_result_clicked', {
      query: result.query,
      resultId: result.document.id,
      collection: result.collection,
    })
  }}
  onResults={(results) => {
    trackSearchEvent('search_completed', {
      query: results.request_params.q,
      resultCount: results.found,
      searchTime: results.search_time_ms,
    })
  }}
/>
```

## Configuration Customization

### Plugin Settings

```typescript
typesenseSearch({
  // Disable plugin
  disabled: false,

  // Global settings
  settings: {
    autoSync: true, // Auto-sync documents
    batchSize: 100, // Batch size for operations
    categorized: false, // Group results by collection
    searchEndpoint: '/api/search',
  },

  // Collection configurations
  collections: {
    posts: {
      enabled: true,
      displayName: 'Blog Posts',
      searchFields: ['title', 'content'],
      facetFields: ['category', 'status'],
      icon: '📝',
      sortFields: ['createdAt', 'title'],
    },
  },
})
```

### Typesense Configuration

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
  connectionTimeoutSeconds: 30,
  numRetries: 5,
  retryIntervalSeconds: 2
}
```

## Next Steps

- [Performance Guide](/guide/performance) - Optimize for speed
- [Troubleshooting](/guide/troubleshooting) - Fix common issues
- [API Reference](/api/search) - Explore advanced features
