# Migration Guide: UnifiedSearchInput to HeadlessSearchInput

This guide helps you migrate from the deprecated `UnifiedSearchInput` component to the new `HeadlessSearchInput` component with enhanced multi-collection support.

## What Changed?

The `UnifiedSearchInput` component has been removed in favor of an enhanced `HeadlessSearchInput` that supports all search patterns in a single component. This change provides:

- **Better Performance**: Smart API endpoint selection (direct vs universal)
- **More Control**: Full control over search behavior and UI
- **Simpler Architecture**: One primary search component supporting all patterns
- **Enhanced Flexibility**: Single, multiple, or all collections in one component

## Migration Patterns

### 1. Single Collection Search

**Before:**

```tsx
import { UnifiedSearchInput } from 'typesense-search-plugin'
;<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  collections={['posts']}
  placeholder="Search posts..."
  onResultClick={(result) => console.log(result)}
/>
```

**After:**

```tsx
import { HeadlessSearchInput } from 'typesense-search-plugin'
;<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  placeholder="Search posts..."
  onResultClick={(result) => console.log(result)}
/>
```

### 2. Multiple Collection Search

**Before:**

```tsx
<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  collections={['posts', 'products']}
  placeholder="Search posts & products..."
  onResultClick={(result) => console.log(result)}
/>
```

**After (Option 1 - Single Component Multi-Collection):**

```tsx
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collections={['posts', 'products']}
  placeholder="Search posts & products..."
  onResultClick={(result) => {
    console.log('Result:', result)
    // Handle navigation based on collection
    if (result.collection === 'posts') {
      // Navigate to post page
    } else if (result.collection === 'products') {
      // Navigate to product page
    }
  }}
/>
```

**After (Option 2 - Multiple Components for Separate Sections):**

```tsx
<div className="multi-collection-search">
  <div className="search-section">
    <h3>Posts</h3>
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collection="posts"
      placeholder="Search posts..."
      onResultClick={(result) => console.log('Post:', result)}
    />
  </div>

  <div className="search-section">
    <h3>Products</h3>
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collection="products"
      placeholder="Search products..."
      onResultClick={(result) => console.log('Product:', result)}
    />
  </div>
</div>
```

**After (Option 3 - Universal Search Component):**

```tsx
// Simple universal search using the component
;<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  placeholder="Search all content..."
  onResultClick={(result) => {
    console.log('Result clicked:', result)
    // Navigate based on collection type
    const routes = {
      posts: '/blog',
      products: '/shop',
      portfolio: '/portfolio',
    }
    // Navigate to appropriate page
  }}
/>

// Advanced: Custom universal search with full control
function CustomUniversalSearch() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUniversalSearch = useCallback(async (query: string) => {
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

  const renderResults = () => {
    if (!results) return null

    return (
      <div className="universal-results">
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
    )
  }

  return (
    <div className="universal-search">
      <input
        type="text"
        placeholder="Search all collections..."
        onChange={(e) => handleUniversalSearch(e.target.value)}
      />
      {loading && <div>Searching...</div>}
      {renderResults()}
    </div>
  )
}
```

### 3. Universal Search (No Collections Prop)

**Before:**

```tsx
<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  placeholder="Search all collections..."
  onResultClick={(result) => console.log(result)}
/>
```

**After:**

```tsx
// Use the universal search implementation from Option 2 above
<UniversalSearch />
```

## Prop Mapping

| UnifiedSearchInput Prop               | HeadlessSearchInput Equivalent                                       | Notes                        |
| ------------------------------------- | -------------------------------------------------------------------- | ---------------------------- |
| `collections={['posts']}`             | `collection="posts"`                                                 | Single collection only       |
| `collections={['posts', 'products']}` | Multiple `HeadlessSearchInput` components or custom universal search | See migration patterns above |
| `baseUrl`                             | `baseUrl`                                                            | Same                         |
| `placeholder`                         | `placeholder`                                                        | Same                         |
| `onResultClick`                       | `onResultClick`                                                      | Same                         |
| `onResults`                           | `onResults`                                                          | Same                         |
| `onSearch`                            | `onSearch`                                                           | Same                         |
| `onError`                             | `onError`                                                            | Same                         |
| `debounceMs`                          | `debounceMs`                                                         | Same                         |
| `minQueryLength`                      | `minQueryLength`                                                     | Same                         |
| `perPage`                             | `perPage`                                                            | Same                         |
| `showLoading`                         | `showLoading`                                                        | Same                         |
| `showResultCount`                     | `showResultCount`                                                    | Same                         |
| `showSearchTime`                      | `showSearchTime`                                                     | Same                         |

## Benefits of Migration

### Performance Improvements

- **Direct API calls**: Collection-specific searches use `/api/search/{collection}` endpoints
- **No client-side filtering**: Results are filtered on the server side
- **Better caching**: Each collection can be cached independently

### Enhanced Control

- **Custom UI**: Complete control over how results are displayed
- **Flexible behavior**: Different search behaviors for different collections
- **Better UX**: Can implement collection-specific features

### Simplified Maintenance

- **One component**: Only `HeadlessSearchInput` to maintain
- **Clearer API**: Single responsibility principle
- **Easier testing**: Simpler component structure

## Migration Checklist

- [ ] Remove `UnifiedSearchInput` imports
- [ ] Replace single collection searches with `HeadlessSearchInput`
- [ ] Replace multiple collection searches with multiple `HeadlessSearchInput` components or custom universal search
- [ ] Update prop names (`collections` → `collection` for single collections)
- [ ] Test search functionality
- [ ] Update styling if needed
- [ ] Remove any custom `UnifiedSearchInput` styling

## Need Help?

If you encounter issues during migration:

1. Check the [HeadlessSearchInput documentation](/components/headless-search-input)
2. Review the [API documentation](/api/search)
3. Look at the [Quick Start guide](/guide/quick-start) for examples
4. [Report an issue](https://github.com/fronttribe/typesense-search/issues) on GitHub

The migration should be straightforward, and you'll benefit from better performance and more control over your search implementation!
