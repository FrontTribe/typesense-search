# Quick Start Guide

Get up and running with the Typesense Search Plugin in minutes!

## 1. Installation

```bash
pnpm add typesense-search-plugin
```

## 2. Basic Setup

Add the plugin to your Payload configuration:

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { typesenseSearch } from 'typesense-search-plugin'

export default buildConfig({
  // ... your existing config
  plugins: [
    typesenseSearch({
      typesense: {
        apiKey: 'xyz',
        nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
      },
      collections: {
        posts: {
          enabled: true,
          displayName: 'Blog Posts',
          searchFields: ['title', 'content'],
          icon: '📝',
        },
        products: {
          enabled: true,
          displayName: 'Products',
          searchFields: ['name', 'description'],
          icon: '🛍️',
        },
      },
    }),
  ],
})
```

## 3. Start Typesense

```bash
docker run -p 8108:8108 \
  -v $(pwd)/typesense-data:/data \
  typesense/typesense:0.25.2 \
  --data-dir /data \
  --api-key=xyz \
  --enable-cors
```

## 4. Add Search to Your UI

### Single Collection Search

```tsx
import { HeadlessSearchInput } from 'typesense-search-plugin'

function PostSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collection="posts"
      placeholder="Search posts..."
      onResultClick={(result) => {
        console.log('Post clicked:', result.document)
        // Navigate to post page
      }}
    />
  )
}
```

### Multiple Collection Search

```tsx
// Option 1: Single component searching multiple collections
function MultiCollectionSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collections={['posts', 'products']}
      placeholder="Search posts & products..."
      onResultClick={(result) => {
        console.log('Result clicked:', result.document)
        // Handle navigation based on collection
        if (result.collection === 'posts') {
          // Navigate to post
        } else if (result.collection === 'products') {
          // Navigate to product
        }
      }}
    />
  )
}

// Option 2: Multiple components for separate sections
function MultiSectionSearch() {
  return (
    <div className="search-container">
      <div className="search-section">
        <h3>Posts</h3>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          collection="posts"
          placeholder="Search posts..."
        />
      </div>

      <div className="search-section">
        <h3>Products</h3>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          collection="products"
          placeholder="Search products..."
        />
      </div>
    </div>
  )
}
```

### Universal Search (All Collections)

```tsx
// Simple universal search using the component
function UniversalSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      placeholder="Search all content..."
      onResultClick={(result) => {
        console.log('Result clicked:', result.document)
        // Navigate based on collection type
        const collectionRoutes = {
          posts: '/blog',
          products: '/shop',
          portfolio: '/portfolio',
        }
        const route = collectionRoutes[result.collection]
        if (route) {
          // Navigate to the appropriate page
        }
      }}
    />
  )
}

// Advanced: Custom universal search with full control
function CustomUniversalSearch() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults(null)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:3000/api/search?q=${encodeURIComponent(query)}&per_page=10`,
      )
      if (response.ok) {
        const searchResults = await response.json()
        setResults(searchResults)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="universal-search">
      <input
        type="text"
        placeholder="Search all collections..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      {loading && <div>Searching...</div>}

      {results && (
        <div className="results">
          <div className="results-header">
            Found {results.found} result{results.found !== 1 ? 's' : ''}
            {results.search_time_ms && ` in ${results.search_time_ms}ms`}
          </div>

          {results.hits?.map((hit, index) => (
            <div
              key={index}
              className="result-item"
              onClick={() => console.log('Result clicked:', hit)}
            >
              <div className="result-header">
                <span className="collection-icon">{hit.icon || '📄'}</span>
                <span className="collection-name">{hit.collection}</span>
              </div>
              <div className="result-title">
                {hit.document?.title || hit.document?.name || 'Untitled'}
              </div>
              <div className="result-description">
                {hit.document?.description || hit.document?.shortDescription || 'No description'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## 5. Style Your Search

```css
/* styles.css */
.search-container {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.search-section {
  flex: 1;
}

.search-section h3 {
  margin-bottom: 10px;
  color: #333;
}

.universal-search {
  position: relative;
  width: 100%;
}

.universal-search input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.results-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
  font-size: 14px;
  color: #666;
}

.result-item {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover {
  background-color: #f8f9fa;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.collection-icon {
  font-size: 16px;
}

.collection-name {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.result-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.result-description {
  font-size: 14px;
  color: #666;
}
```

## 6. Test Your Search

1. Start your Payload CMS development server
2. Create some test content in your collections
3. Try searching in your UI components
4. Check the browser network tab to see API calls

## Next Steps

- [Configure collections](/guide/configuration) for optimal search
- [Customize search behavior](/guide/customization)
- [Explore advanced features](/components/headless-search-input)
- [Read the full API documentation](/api/search)

## Troubleshooting

**Search not working?**

- Check that Typesense is running on port 8108
- Verify your API key matches in both Payload config and Typesense
- Check browser console for any errors

**No results found?**

- Make sure your collections are enabled in the plugin configuration
- Verify that your content has been synced to Typesense
- Check the `/api/search/health` endpoint for service status

Happy searching! 🚀
