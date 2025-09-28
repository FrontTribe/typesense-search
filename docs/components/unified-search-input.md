# UnifiedSearchInput Component - DEPRECATED

> **⚠️ DEPRECATED**: The `UnifiedSearchInput` component has been removed in favor of the enhanced `HeadlessSearchInput` component that now supports all search patterns including multi-collection search.

## Migration Guide

If you were using `UnifiedSearchInput`, you can now use the enhanced `HeadlessSearchInput` with the same functionality:

### Option 1: Direct Replacement with Multi-Collection Support

**Before (UnifiedSearchInput):**

```tsx
import { UnifiedSearchInput } from 'typesense-search-plugin'
;<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  collections={['posts', 'products']}
  placeholder="Search posts & products..."
/>
```

**After (Enhanced HeadlessSearchInput):**

```tsx
import { HeadlessSearchInput } from 'typesense-search-plugin'
;<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collections={['posts', 'products']}
  placeholder="Search posts & products..."
/>
```

### Option 2: Multiple HeadlessSearchInput Components

**After (Multiple HeadlessSearchInput):**

```tsx
import { HeadlessSearchInput } from 'typesense-search-plugin'
;<div className="multi-collection-search">
  <HeadlessSearchInput
    baseUrl="http://localhost:3000"
    collection="posts"
    placeholder="Search posts..."
  />
  <HeadlessSearchInput
    baseUrl="http://localhost:3000"
    collection="products"
    placeholder="Search products..."
  />
</div>
```

### Option 2: Universal Search Implementation

**Before (UnifiedSearchInput with universal search):**

```tsx
<UnifiedSearchInput baseUrl="http://localhost:3000" placeholder="Search all collections..." />
```

**After (Custom Universal Search):**

```tsx
import { useState, useCallback } from 'react'

function UniversalSearch() {
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

  return (
    <div className="universal-search">
      <input
        type="text"
        placeholder="Search all collections..."
        onChange={(e) => handleUniversalSearch(e.target.value)}
      />
      {loading && <div>Searching...</div>}
      {/* Render results */}
    </div>
  )
}
```

## Why Was UnifiedSearchInput Removed?

1. **Simplified Architecture**: Having one primary search component reduces complexity
2. **Better Performance**: Collection-specific searches are more efficient than filtering universal results
3. **More Control**: Developers have full control over multi-collection search implementations
4. **Flexibility**: Easier to customize search behavior for different use cases

## Benefits of the New Approach

- **🎯 Better Performance**: Direct collection-specific API calls
- **🔧 More Control**: Full control over search behavior and UI
- **🎨 Flexible Styling**: Easy to customize each search input independently
- **📱 Better UX**: Can implement different UX patterns for different collections
- **🚀 Maintainability**: Simpler codebase with one search component

## Complete Example

See the [HeadlessSearchInput documentation](./headless-search-input.md) for complete examples of both single collection and multiple collection search patterns.
