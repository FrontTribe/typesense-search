# UnifiedSearchInput Component

A React component that provides a unified search interface across all enabled collections.

## Import

```typescript
import { UnifiedSearchInput } from '@fronttribe/typesense-search'
// or
import UnifiedSearchInput from '@fronttribe/typesense-search/components/UnifiedSearchInput'
```

## Props

| Prop                     | Type                                                       | Default       | Description                                                                             |
| ------------------------ | ---------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `baseUrl`                | `string`                                                   | **Required**  | Base URL of your Payload CMS instance                                                   |
| `collections`            | `string[]`                                                 | `undefined`   | Array of collection names to search (if not provided, searches all enabled collections) |
| `debounceMs`             | `number`                                                   | `300`         | Debounce delay in milliseconds                                                          |
| `includeFullDocument`    | `boolean`                                                  | `undefined`   | Include full document data in results                                                   |
| `inputClassName`         | `string`                                                   | `''`          | CSS class for the input element                                                         |
| `minQueryLength`         | `number`                                                   | `2`           | Minimum query length before searching                                                   |
| `onError`                | `(error: string) => void`                                  | `undefined`   | Callback when search fails                                                              |
| `onResultClick`          | `(result: SearchResult<T>) => void`                        | `undefined`   | Callback when a result is clicked                                                       |
| `onResults`              | `(results: SearchResponse<T>) => void`                     | `undefined`   | Callback when search results are received                                               |
| `onSearch`               | `(query: string) => void`                                  | `undefined`   | Callback when search is performed                                                       |
| `perPage`                | `number`                                                   | `10`          | Number of results per page                                                              |
| `placeholder`            | `string`                                                   | `'Search...'` | Input placeholder text                                                                  |
| `renderLoading`          | `() => React.ReactNode`                                    | `undefined`   | Custom loading renderer                                                                 |
| `renderNoResults`        | `(query: string) => React.ReactNode`                       | `undefined`   | Custom no results renderer                                                              |
| `renderResult`           | `(hit: SearchResult<T>, index: number) => React.ReactNode` | `undefined`   | Custom result renderer                                                                  |
| `resultsClassName`       | `string`                                                   | `''`          | CSS class for the results container                                                     |
| `showLoading`            | `boolean`                                                  | `true`        | Show loading indicator                                                                  |
| `showResultCount`        | `boolean`                                                  | `true`        | Show result count                                                                       |
| `showSearchTime`         | `boolean`                                                  | `true`        | Show search time                                                                        |
| `className`              | `string`                                                   | `''`          | CSS class for the container                                                             |
| `errorClassName`         | `string`                                                   | `''`          | CSS class for error state                                                               |
| `inputWrapperClassName`  | `string`                                                   | `''`          | CSS class for input wrapper                                                             |
| `loadingClassName`       | `string`                                                   | `''`          | CSS class for loading state                                                             |
| `maxResults`             | `number`                                                   | `undefined`   | Maximum number of results to display                                                    |
| `noResultsClassName`     | `string`                                                   | `''`          | CSS class for no results state                                                          |
| `onLoading`              | `(loading: boolean) => void`                               | `undefined`   | Callback when loading state changes                                                     |
| `resultsHeaderClassName` | `string`                                                   | `''`          | CSS class for results header                                                            |
| `resultsListClassName`   | `string`                                                   | `''`          | CSS class for results list                                                              |

## Basic Usage

```tsx
import { UnifiedSearchInput } from '@fronttribe/typesense-search'

function SearchPage() {
  const handleResultClick = (result) => {
    console.log('Result clicked:', result)
    // Navigate to result page
  }

  return (
    <UnifiedSearchInput
      baseUrl="http://localhost:3000"
      placeholder="Search across all collections..."
      onResultClick={handleResultClick}
    />
  )
}
```

## Advanced Usage

```tsx
import { UnifiedSearchInput } from '@fronttribe/typesense-search'

function AdvancedSearch() {
  const [searchHistory, setSearchHistory] = useState([])

  const handleSearch = (query) => {
    setSearchHistory((prev) => [query, ...prev.slice(0, 4)])
  }

  const handleResults = (results) => {
    console.log(`Found ${results.found} results in ${results.search_time_ms}ms`)
  }

  const customRenderResult = (hit, index) => (
    <div key={hit.id} className="custom-result">
      <h3>{hit.document.title}</h3>
      <p>{hit.document.content}</p>
      <span className="collection">{hit.collection}</span>
    </div>
  )

  return (
    <div>
      <UnifiedSearchInput
        baseUrl="http://localhost:3000"
        collections={['posts', 'pages']}
        debounceMs={500}
        minQueryLength={3}
        perPage={20}
        placeholder="Search posts and pages..."
        onSearch={handleSearch}
        onResults={handleResults}
        renderResult={customRenderResult}
        showSearchTime={true}
        showResultCount={true}
      />

      {searchHistory.length > 0 && (
        <div>
          <h3>Recent Searches</h3>
          {searchHistory.map((query, i) => (
            <span key={i} className="search-tag">
              {query}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Styling

The component uses CSS modules for styling. You can override styles by providing custom classes:

```tsx
<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  inputClassName="my-custom-input"
  resultsClassName="my-custom-results"
  placeholder="Custom styled search..."
/>
```

## Event Handlers

### onResultClick

Called when a user clicks on a search result:

```tsx
const handleResultClick = (result) => {
  // result.document contains the full document
  // result.collection contains the collection name
  // result.highlight contains highlighted text
  console.log('Clicked result:', result.document.title)
}
```

### onResults

Called when search results are received:

```tsx
const handleResults = (results) => {
  console.log(`Found ${results.found} results`)
  console.log('Collections searched:', results.collections)
  console.log('Search time:', results.search_time_ms + 'ms')
}
```

### onSearch

Called when a search is performed:

```tsx
const handleSearch = (query) => {
  console.log('Searching for:', query)
  // Track search analytics
  analytics.track('search_performed', { query })
}
```

### onError

Called when search fails:

```tsx
const handleError = (error) => {
  console.error('Search error:', error)
  // Show user-friendly error message
  toast.error('Search failed. Please try again.')
}
```

## Custom Rendering

You can provide custom renderers for different states:

```tsx
const customRenderLoading = () => (
  <div className="loading-spinner">
    <div className="spinner" />
    <span>Searching across all collections...</span>
  </div>
)

const customRenderNoResults = (query) => (
  <div className="no-results">
    <h3>No results found for "{query}"</h3>
    <p>Try different keywords or check your spelling.</p>
  </div>
)

<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  renderLoading={customRenderLoading}
  renderNoResults={customRenderNoResults}
/>
```

## TypeScript Support

The component is fully typed with TypeScript:

```tsx
import { UnifiedSearchInput, SearchResult, SearchResponse } from '@fronttribe/typesense-search'

interface MyDocument {
  id: string
  title: string
  content: string
  category: string
}

function TypedSearch() {
  const handleResultClick = (result: SearchResult<MyDocument>) => {
    // result.document is typed as MyDocument
    console.log(result.document.category)
  }

  return (
    <UnifiedSearchInput<MyDocument>
      baseUrl="http://localhost:3000"
      onResultClick={handleResultClick}
    />
  )
}
```

## Accessibility

The component includes built-in accessibility features:

- ARIA labels for screen readers
- Keyboard navigation (Arrow keys, Enter, Escape)
- Focus management
- Semantic HTML structure

## Performance

- Debounced search to prevent excessive API calls
- Built-in caching for search results
- Efficient re-rendering with React hooks
- Lazy loading of results
