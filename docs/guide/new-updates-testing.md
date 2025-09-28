# New Updates Testing Guide

This guide explains the recent updates to the Typesense Search Plugin and how to test the new functionality.

## 🚀 What's New

### Major Changes

1. **Enhanced `HeadlessSearchInput` Component**
   - The `UnifiedSearchInput` component has been completely removed
   - `HeadlessSearchInput` now supports single, multiple, or all collections
   - Single component handles all search patterns with smart API selection

2. **Simplified Architecture**
   - One component for all search needs
   - Smart endpoint selection: direct collection API or universal search
   - Client-side filtering for multiple collections when needed

3. **Enhanced Performance**
   - Direct API calls to `/api/search/{collection}` for single collections
   - Universal search with client-side filtering for multiple collections
   - Optimal performance for each use case

## 🧪 How to Test the New Updates

### Prerequisites

Make sure your development environment is set up:

```bash
# Start Typesense and MongoDB
docker compose up -d

# Start the development server
npm run dev
```

### 1. Test Multi-Collection Search Patterns

Navigate to the search demo page in your development environment (typically at `http://localhost:3000/search-demo` or `http://localhost:3001/search-demo`)

#### Test Single Collection Search

**Posts Collection Search:**

```typescript
// This should only search the 'posts' collection
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  placeholder="Search posts..."
/>
```

**Test Steps:**

1. Go to the "Multi-Collection Search" section
2. In the "Posts Collection" input, search for: `Next.js`
3. Verify results only show posts, not products or portfolio items
4. Check the browser network tab - should call `/api/search/posts?q=Next.js`

**Portfolio Collection Search:**

```typescript
// This should only search the 'portfolio' collection
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="portfolio"
  placeholder="Search portfolio..."
/>
```

**Test Steps:**

1. In the "Portfolio Collection" input, search for: `design`
2. Verify results only show portfolio items
3. Check the browser network tab - should call `/api/search/portfolio?q=design`

#### Test Multiple Collections with Single Component

**Posts + Products Search:**

```typescript
// This searches both 'posts' and 'products' collections
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collections={['posts', 'products']}
  placeholder="Search posts & products..."
/>
```

**Test Steps:**

1. Go to the "Multi-Collection Search Component" section
2. In the "Portfolio + Products" input, search for: `design`
3. Verify results show both portfolio and products items
4. Check the browser network tab - should call `/api/search?q=design` (universal)
5. Verify client-side filtering is working correctly

#### Test All Collections Search

**Universal Search Component:**

```typescript
// This searches all collections (no collection props)
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  placeholder="Search all collections..."
/>
```

**Test Steps:**

1. Go to the "All Collections" input
2. Search for: `TypeScript`
3. Verify results show items from all collections
4. Check the browser network tab - should call `/api/search?q=TypeScript` (universal)

### 2. Test Universal Search (Custom Implementation)

**Custom Universal Search Implementation:**

```typescript
// This searches all collections using the universal endpoint
const handleUniversalSearch = async (query: string) => {
  const response = await fetch(
    `http://localhost:3000/api/search?q=${encodeURIComponent(query)}&per_page=10`,
  )
  const results = await response.json()
  // Results include hits from all collections with collection metadata
}
```

**Test Steps:**

1. Go to the "Universal Search" section
2. Search for: `TypeScript`
3. Verify results show items from multiple collections
4. Check that each result shows the collection name/icon
5. Check the browser network tab - should call `/api/search?q=TypeScript`

### 3. Test API Endpoints Directly

#### Collection-Specific Endpoints

```bash
# Test posts collection
curl "http://localhost:3000/api/search/posts?q=server&per_page=5"

# Test portfolio collection
curl "http://localhost:3000/api/search/portfolio?q=design&per_page=5"

# Test products collection
curl "http://localhost:3000/api/search/products?q=laptop&per_page=5"
```

**Expected Response:**

```json
{
  "collections": [{"collection": "posts", "found": 2}],
  "found": 2,
  "hits": [
    {
      "collection": "posts",
      "document": {
        "id": "1",
        "title": "Server-Side Rendering with Next.js",
        "content": "..."
      },
      "highlight": {...},
      "text_match": 123
    }
  ],
  "page": 1,
  "request_params": {"q": "server", "per_page": 5},
  "search_cutoff": false,
  "search_time_ms": 3
}
```

#### Universal Search Endpoint

```bash
# Test universal search
curl "http://localhost:3000/api/search?q=Next.js&per_page=10"
```

**Expected Response:**

```json
{
  "collections": [
    {"collection": "posts", "found": 2},
    {"collection": "portfolio", "found": 1}
  ],
  "found": 3,
  "hits": [
    {
      "collection": "posts",
      "document": {...},
      "highlight": {...}
    },
    {
      "collection": "portfolio",
      "document": {...},
      "highlight": {...}
    }
  ],
  "page": 1,
  "request_params": {"q": "Next.js", "per_page": 10},
  "search_cutoff": false,
  "search_time_ms": 5
}
```

### 4. Test Component Props and Features

#### Basic Props Test

```typescript
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  placeholder="Custom placeholder..."
  debounceMs={500}
  minQueryLength={3}
  perPage={5}
  showLoading={true}
  showResultCount={true}
  showSearchTime={true}
/>
```

**Test Steps:**

1. Verify custom placeholder appears
2. Type quickly - should debounce for 500ms
3. Type less than 3 characters - should not search
4. Verify loading indicator appears
5. Verify result count and search time display

#### Event Handlers Test

```typescript
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  onSearch={(query, results) => {
    console.log('Search performed:', query)
  }}
  onResults={(results) => {
    console.log('Results received:', results)
  }}
  onResultClick={(result) => {
    console.log('Result clicked:', result.document)
  }}
  onError={(error) => {
    console.log('Search error:', error)
  }}
/>
```

**Test Steps:**

1. Open browser console
2. Perform searches and verify console logs
3. Click on results and verify click events
4. Test error scenarios (e.g., stop Typesense server)

### 5. Test Custom Rendering

#### Custom Result Rendering

```typescript
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  renderResult={(result, index) => (
    <div key={index} className="custom-result">
      <h3>{result.document.title}</h3>
      <p>{result.document.description}</p>
      <span className="collection">{result.collection}</span>
    </div>
  )}
/>
```

**Test Steps:**

1. Verify custom result rendering works
2. Check that result data is accessible
3. Verify collection information is available

#### Custom Loading State

```typescript
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  renderLoading={() => (
    <div className="custom-loading">
      <div className="spinner"></div>
      <span>Searching posts...</span>
    </div>
  )}
/>
```

**Test Steps:**

1. Verify custom loading state appears
2. Check that loading shows during search

### 6. Test Error Handling

#### Network Errors

```typescript
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  onError={(error) => {
    console.error('Search failed:', error)
    // Handle error (show toast, etc.)
  }}
/>
```

**Test Steps:**

1. Stop Typesense server: `docker compose stop typesense`
2. Perform a search
3. Verify error callback is triggered
4. Restart Typesense: `docker compose start typesense`

#### Invalid Collection

```typescript
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="nonexistent"
  onError={(error) => {
    console.error('Collection error:', error)
  }}
/>
```

**Test Steps:**

1. Use an invalid collection name
2. Perform a search
3. Verify error handling works

### 7. Test Performance

#### Search Speed

```bash
# Test search performance
curl -w "@curl-format.txt" "http://localhost:3000/api/search/posts?q=test"
```

Create `curl-format.txt`:

```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

**Expected Results:**

- Search times should be under 10ms for most queries
- Collection-specific searches should be faster than universal searches

#### Memory Usage

```typescript
// Test with large result sets
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  perPage={100}
  maxResults={1000}
/>
```

**Test Steps:**

1. Search for common terms that return many results
2. Monitor browser memory usage
3. Verify no memory leaks with repeated searches

### 8. Test Migration from UnifiedSearchInput

If you have existing code using `UnifiedSearchInput`, test the migration:

#### Before (UnifiedSearchInput)

```typescript
<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  collections={['posts']}
  placeholder="Search posts..."
/>
```

#### After (HeadlessSearchInput)

```typescript
<HeadlessSearchInput
  baseUrl="http://localhost:3000"
  collection="posts"
  placeholder="Search posts..."
/>
```

**Test Steps:**

1. Replace `UnifiedSearchInput` with `HeadlessSearchInput`
2. Update props according to migration guide
3. Verify functionality works the same
4. Check for performance improvements

### 9. Test Multiple Collection Patterns

#### Pattern 1: Multiple HeadlessSearchInput Components

```typescript
function MultiCollectionSearch() {
  return (
    <div className="multi-collection-search">
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

**Test Steps:**

1. Verify each search box works independently
2. Check that results are collection-specific
3. Verify different styling/behavior per collection

#### Pattern 2: Custom Universal Search

```typescript
function UniversalSearch() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (query) => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:3000/api/search?q=${encodeURIComponent(query)}&per_page=10`
      )
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search all collections..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      {loading && <div>Searching...</div>}
      {results && (
        <div>
          <div>Found {results.found} results</div>
          {results.hits.map((hit, index) => (
            <div key={index}>
              <strong>{hit.collection}:</strong> {hit.document.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Test Steps:**

1. Verify universal search works
2. Check that results include collection metadata
3. Verify custom UI rendering works

## 🔍 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Make sure you're using `typesense-search-plugin` not `@fronttribe/typesense-search`
   - Check import paths are correct

2. **Search not working**
   - Verify Typesense is running: `docker compose ps`
   - Check API endpoints: `curl http://localhost:3000/api/search/health`

3. **No results found**
   - Verify collections are enabled in plugin config
   - Check if data is synced: `npm run sync`

4. **TypeScript errors**
   - Update imports to use `HeadlessSearchInput`
   - Check that all required props are provided

### Debug Tools

```bash
# Check Typesense status
curl http://localhost:3000/api/search/health

# Check collections
curl http://localhost:3000/api/search/collections

# Test specific collection
curl "http://localhost:3000/api/search/posts?q=test"

# Check plugin logs
npm run dev  # Look for plugin initialization logs
```

## ✅ Success Criteria

Your new setup is working correctly if:

1. ✅ Collection-specific searches only return results from that collection
2. ✅ Universal search returns results from all collections with metadata
3. ✅ Search performance is under 10ms for most queries
4. ✅ All component props work as expected
5. ✅ Error handling works for network issues
6. ✅ Custom rendering functions work
7. ✅ Migration from `UnifiedSearchInput` is successful
8. ✅ No console errors or warnings

## 🎯 Next Steps

After testing, you can:

1. **Customize the UI** - Use the custom rendering props to match your design
2. **Optimize Performance** - Adjust debounce, pagination, and caching settings
3. **Add Analytics** - Use the event handlers to track search behavior
4. **Scale Up** - Test with larger datasets and more collections

Happy testing! 🚀
