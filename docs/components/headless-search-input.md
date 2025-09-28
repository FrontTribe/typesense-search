# HeadlessSearchInput Component

A powerful, headless React component for searching within collections. This is the primary search component that provides complete control over rendering and behavior. It supports both single collection searches and multiple collection searches using a single component.

## Import

```typescript
import { HeadlessSearchInput } from 'typesense-search-plugin'
// or
import HeadlessSearchInput from 'typesense-search-plugin/components/HeadlessSearchInput'
```

## Props

| Prop                     | Type                                                          | Default       | Description                                      |
| ------------------------ | ------------------------------------------------------------- | ------------- | ------------------------------------------------ |
| `baseUrl`                | `string`                                                      | **Required**  | Base URL of your Payload CMS instance            |
| `collection`             | `string`                                                      | -             | Collection name to search in (single collection) |
| `collections`            | `string[]`                                                    | -             | Collections to search in (multi-collection)      |
| `className`              | `string`                                                      | `''`          | CSS class for the container                      |
| `debounceMs`             | `number`                                                      | `300`         | Debounce delay in milliseconds                   |
| `enableSuggestions`      | `boolean`                                                     | `true`        | Enable search suggestions                        |
| `errorClassName`         | `string`                                                      | `''`          | CSS class for error state                        |
| `inputClassName`         | `string`                                                      | `''`          | CSS class for the input element                  |
| `inputWrapperClassName`  | `string`                                                      | `''`          | CSS class for input wrapper                      |
| `loadingClassName`       | `string`                                                      | `''`          | CSS class for loading state                      |
| `minQueryLength`         | `number`                                                      | `2`           | Minimum query length before searching            |
| `noResultsClassName`     | `string`                                                      | `''`          | CSS class for no results state                   |
| `onResultClick`          | `(result: SearchResult<T>) => void`                           | `undefined`   | Callback when a result is clicked                |
| `onResults`              | `(results: SearchResponse<T>) => void`                        | `undefined`   | Callback when search results are received        |
| `onSearch`               | `(query: string, results: SearchResponse<T>) => void`         | `undefined`   | Callback when search is performed                |
| `perPage`                | `number`                                                      | `10`          | Number of results per page                       |
| `placeholder`            | `string`                                                      | `'Search...'` | Input placeholder text                           |
| `renderError`            | `(error: string) => React.ReactNode`                          | `undefined`   | Custom error renderer                            |
| `renderInput`            | `(props: InputProps) => React.ReactNode`                      | `undefined`   | Custom input renderer                            |
| `renderLoading`          | `() => React.ReactNode`                                       | `undefined`   | Custom loading renderer                          |
| `renderNoResults`        | `(query: string) => React.ReactNode`                          | `undefined`   | Custom no results renderer                       |
| `renderResult`           | `(result: SearchResult<T>, index: number) => React.ReactNode` | `undefined`   | Custom result renderer                           |
| `renderResultsHeader`    | `(found: number, searchTime: number) => React.ReactNode`      | `undefined`   | Custom results header renderer                   |
| `resultItemClassName`    | `string`                                                      | `''`          | CSS class for individual result items            |
| `resultsClassName`       | `string`                                                      | `''`          | CSS class for the results container              |
| `resultsHeaderClassName` | `string`                                                      | `''`          | CSS class for results header                     |
| `resultsListClassName`   | `string`                                                      | `''`          | CSS class for results list                       |
| `showLoading`            | `boolean`                                                     | `true`        | Show loading indicator                           |
| `showResultCount`        | `boolean`                                                     | `true`        | Show result count                                |
| `showSearchTime`         | `boolean`                                                     | `true`        | Show search time                                 |
| `maxResults`             | `number`                                                      | `undefined`   | Maximum number of results to display             |
| `perPage`                | `number`                                                      | `10`          | Number of results per page                       |
| `onError`                | `(error: string) => void`                                     | `undefined`   | Callback when search fails                       |
| `onLoading`              | `(loading: boolean) => void`                                  | `undefined`   | Callback when loading state changes              |

**Note**: You can provide either `collection` (single), `collections` (multiple), or neither (all collections). The component will automatically choose the most efficient API endpoint.

## Basic Usage - Single Collection

```tsx
import { HeadlessSearchInput } from 'typesense-search-plugin'

function PostSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collection="posts"
      placeholder="Search posts..."
    />
  )
}
```

## Multiple Collection Search

The `HeadlessSearchInput` component supports multiple collection search patterns:

### Option 1: Multiple Collections with Single Component

```tsx
function MultiCollectionSearch() {
  return (
    <div className="multi-collection-search">
      {/* Search specific collections */}
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collections={['posts', 'products']}
        placeholder="Search posts & products..."
        onResultClick={(result) => console.log('Result clicked:', result)}
      />

      {/* Search all collections */}
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        placeholder="Search all collections..."
        onResultClick={(result) => console.log('Result clicked:', result)}
      />
    </div>
  )
}
```

### Option 2: Multiple Collection-Specific Inputs

```tsx
function MultiCollectionSearch() {
  return (
    <div className="multi-collection-search">
      <div className="search-section">
        <h3>Posts</h3>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          collection="posts"
          placeholder="Search posts..."
          onResultClick={(result) => console.log('Post clicked:', result)}
        />
      </div>

      <div className="search-section">
        <h3>Products</h3>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          collection="products"
          placeholder="Search products..."
          onResultClick={(result) => console.log('Product clicked:', result)}
        />
      </div>
    </div>
  )
}
```

### Option 3: Custom Universal Search Implementation

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
      // Use the universal search endpoint that searches all collections
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

  const renderUniversalResults = () => {
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
      {renderUniversalResults()}
    </div>
  )
}
```

## Advanced Usage with Custom Rendering

```tsx
import { HeadlessSearchInput } from 'typesense-search-plugin'

function CustomPostSearch() {
  const customRenderResult = (result, index) => (
    <div
      key={result.id}
      className="custom-result-item"
      data-result-item
      onClick={() => console.log('Clicked:', result)}
    >
      <h3>{result.title}</h3>
      <p>{result.document.content}</p>
      <span className="match-score">{result.text_match}% match</span>
    </div>
  )

  const customRenderInput = (props) => (
    <div className="search-input-wrapper">
      <input {...props} />
      <span className="search-icon">🔍</span>
    </div>
  )

  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collection="posts"
      className="my-search-container"
      inputClassName="my-input"
      resultsClassName="my-results"
      resultItemClassName="my-result-item"
      placeholder="Search posts..."
      renderInput={customRenderInput}
      renderResult={customRenderResult}
      debounceMs={500}
      minQueryLength={3}
      perPage={20}
    />
  )
}
```

## Custom Input Rendering

The `renderInput` prop gives you complete control over the input element:

```tsx
const customInputRenderer = (props) => (
  <div className="search-input-container">
    <input {...props} />
    <button
      type="button"
      onClick={() => props.onChange({ target: { value: '' } } as any)}
    >
      Clear
    </button>
  </div>
)

<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  renderInput={customInputRenderer}
/>
```

## Keyboard Navigation

The component includes built-in keyboard navigation:

- **Arrow Down**: Move to next result
- **Arrow Up**: Move to previous result
- **Enter**: Select current result
- **Escape**: Close results

```tsx
// Results are automatically focusable with data-result-item attribute
const customRenderResult = (result, index) => (
  <div
    data-result-item
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        // Handle selection
      }
    }}
  >
    {result.title}
  </div>
)
```

## Event Handlers

### onResultClick

```tsx
const handleResultClick = (result) => {
  // Navigate to result page
  router.push(`/posts/${result.document.id}`)
}
```

### onResults

```tsx
const handleResults = (results) => {
  // Track search analytics
  analytics.track('search_results', {
    query: results.request_params.q,
    found: results.found,
    searchTime: results.search_time_ms,
  })
}
```

### onSearch

```tsx
const handleSearch = (query, results) => {
  console.log(`Searching for "${query}" found ${results.found} results`)
}
```

## Styling with CSS Modules

The component uses CSS modules. You can override styles:

```css
/* styles.css */
.my-search-container {
  position: relative;
  width: 100%;
}

.my-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
}

.my-results {
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

.my-result-item {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.my-result-item:hover {
  background-color: #f8f9fa;
}

.my-result-item:focus {
  outline: 2px solid #0070f3;
  outline-offset: -2px;
}
```

## TypeScript Support

```tsx
import { HeadlessSearchInput, SearchResult, SearchResponse } from 'typesense-search-plugin'

interface PostDocument {
  id: string
  title: string
  content: string
  category: string
  status: 'draft' | 'published'
}

function TypedPostSearch() {
  const handleResultClick = (result: SearchResult<PostDocument>) => {
    // result.document is typed as PostDocument
    console.log(result.document.category)
  }

  return (
    <HeadlessSearchInput<PostDocument>
      baseUrl="http://localhost:3000"
      collection="posts"
      onResultClick={handleResultClick}
    />
  )
}
```

## Performance Optimization

- Debounced search prevents excessive API calls
- Efficient re-rendering with React hooks
- Built-in caching for search results
- Lazy loading of results

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Semantic HTML structure
- Proper role attributes
