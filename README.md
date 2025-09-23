# Typesense Search Plugin for Payload CMS

A powerful, production-ready search plugin that integrates Typesense with Payload CMS, providing lightning-fast, typo-tolerant search capabilities with real-time synchronization.

## 🚀 Features

- **⚡ Lightning Fast**: Sub-millisecond search response times powered by Typesense
- **🎯 Accurate Results**: Precise matching with configurable typo tolerance
- **🔍 Universal Search**: Search across all collections simultaneously with unified results
- **🎯 Collection-Specific**: Target specific collections for focused searches
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **🎨 Customizable**: Fully customizable UI, search behavior, and result rendering
- **🔄 Real-time Sync**: Automatic synchronization with Payload CMS changes
- **🛡️ Production Ready**: Optimized for production with error handling and performance monitoring
- **🔌 Plug & Play**: Zero-configuration setup - just add to your Payload config
- **📊 Rich Metadata**: Collection icons, display names, and categorization

## 📦 Installation

```bash
npm install typesense-search-plugin
# or
yarn add typesense-search-plugin
# or
pnpm add typesense-search-plugin
```

## 🏗️ Setup

### 1. Install Typesense and MongoDB

#### Option A: Using Docker Compose (Recommended)

The project includes a `docker-compose.yml` file that sets up both Typesense and MongoDB:

```bash
# Start both Typesense and MongoDB
docker-compose up -d

# Check status
docker-compose ps
```

This will start:
- **MongoDB** on port `27017` (for Payload CMS data)
- **Typesense** on port `8108` (for search functionality)

#### Option B: Manual Docker Setup

```bash
# Start MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:7.0

# Start Typesense
docker run -p 8108:8108 -v/tmp/typesense-data:/data typesense/typesense:0.25.2 --data-dir /data --api-key=xyz --enable-cors
```

#### Option C: Local Installation

```bash
# Install Typesense locally
# See: https://typesense.org/docs/guide/install-typesense.html

# Install MongoDB locally
# See: https://docs.mongodb.com/manual/installation/
```

**Note:** The `typesense-data` folder is created automatically by Typesense when it runs and is already included in `.gitignore`. You don't need to create it manually.

### 2. Configure Payload CMS

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
        connectionTimeoutSeconds: 2,
      },
      collections: {
        posts: {
          enabled: true,
          searchFields: ['title', 'content'],
          facetFields: ['category', 'status'],
          displayName: 'Blog Posts',
          icon: '📝',
        },
        media: {
          enabled: true,
          searchFields: ['filename', 'alt'],
          facetFields: ['type'],
          displayName: 'Media Files',
          icon: '🖼️',
        },
        portfolio: {
          enabled: true,
          searchFields: [
            'title',
            'description',
            'shortDescription',
            'technologies.name',
            'tags.tag',
          ],
          facetFields: ['status', 'featured'],
          displayName: 'Portfolio',
          icon: '💼',
        },
      },
      settings: {
        categorized: true,
        autoSync: true,
      },
    }),
  ],
})
```

### 3. Use the Search Components

```tsx
// pages/search.tsx
import { UnifiedSearchInput } from 'typesense-search-plugin'

export default function SearchPage() {
  const handleResultClick = (result) => {
    console.log('Selected result:', result.document)
  }

  const handleSearch = (query) => {
    console.log('Search performed:', query)
  }

  const handleResults = (results) => {
    console.log('Search results:', results)
  }

  const handleError = (error) => {
    console.error('Search error:', error)
  }

  return (
    <div>
      <h1>Search</h1>
      <UnifiedSearchInput
        baseUrl="http://localhost:3000"
        placeholder="Search everything..."
        onResultClick={handleResultClick}
        onSearch={handleSearch}
        onResults={handleResults}
        onError={handleError}
        debounceMs={300}
        minQueryLength={2}
        perPage={10}
        showLoading={true}
        showSearchTime={true}
        showResultCount={true}
      />
    </div>
  )
}
```

## 🎛️ Configuration Options

### Plugin Configuration

```typescript
interface TypesenseSearchConfig {
  typesense: {
    apiKey: string
    nodes: Array<{
      host: string
      port: number | string
      protocol: 'http' | 'https'
    }>
    connectionTimeoutSeconds?: number
  }
  collections: Record<
    string,
    {
      enabled: boolean
      searchFields: string[]
      facetFields: string[]
      displayName?: string
      icon?: string
    }
  >
  settings?: {
    categorized?: boolean
  }
}
```

### Component Props

```typescript
interface UnifiedSearchInputProps {
  baseUrl: string
  collections?: string[]
  placeholder?: string
  debounceMs?: number
  minQueryLength?: number
  perPage?: number
  showLoading?: boolean
  showSearchTime?: boolean
  showResultCount?: boolean
  inputClassName?: string
  resultsClassName?: string
  onSearch?: (query: string) => void
  onResults?: (results: SearchResponse) => void
  onResultClick?: (result: SearchHit) => void
  onError?: (error: string) => void
  renderResult?: (hit: SearchHit, index: number) => React.ReactNode
  renderNoResults?: (query: string) => React.ReactNode
  renderLoading?: () => React.ReactNode
}
```

## 🔧 API Endpoints

The plugin automatically creates the following API endpoints:

- `GET /api/search/collections` - Get available collections with metadata
- `GET /api/search?q={query}` - Universal search across all collections
- `GET /api/search/{collection}?q={query}` - Search a specific collection
- `POST /api/search/{collection}` - Advanced search with filters
- `GET /api/search/{collection}/suggest?q={query}` - Search suggestions for autocomplete

### Example API Usage

```typescript
// Get collections with metadata
const collections = await fetch('/api/search/collections').then((r) => r.json())

// Universal search across all collections
const universalResults = await fetch('/api/search?q=typescript&per_page=10').then((r) => r.json())

// Search specific collection
const results = await fetch('/api/search/posts?q=typescript&per_page=10').then((r) => r.json())

// Advanced search with filters
const advancedResults = await fetch('/api/search/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    q: 'typescript',
    page: 1,
    per_page: 10,
    sort_by: 'createdAt:desc',
    filters: {
      status: 'published',
      category: 'programming',
    },
  }),
}).then((r) => r.json())

// Search suggestions for autocomplete
const suggestions = await fetch('/api/search/posts/suggest?q=typesc').then((r) => r.json())
```

## 🎨 Customization

### Custom Result Rendering

```tsx
const customRenderResult = (hit, index) => (
  <div key={index} className="custom-result">
    <h3>{hit.document.title}</h3>
    <p>{hit.document.description}</p>
    <div dangerouslySetInnerHTML={{ __html: hit.highlight?.content }} />
  </div>
)

<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  renderResult={customRenderResult}
  // ... other props
/>
```

### Custom Styling

```tsx
<UnifiedSearchInput
  baseUrl="http://localhost:3000"
  inputClassName="my-search-input"
  resultsClassName="my-search-results"
  // ... other props
/>
```

## 🚀 Production Deployment

### 1. Environment Variables

```bash
# .env.production
TYPESENSE_API_KEY=your-production-api-key
TYPESENSE_HOST=your-typesense-host
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
```

### 2. Production Configuration

```typescript
// payload.config.ts
const typesenseConfig = {
  typesense: {
    apiKey: process.env.TYPESENSE_API_KEY,
    nodes: [
      {
        host: process.env.TYPESENSE_HOST,
        port: parseInt(process.env.TYPESENSE_PORT),
        protocol: process.env.TYPESENSE_PROTOCOL as 'http' | 'https',
      },
    ],
    connectionTimeoutSeconds: 5,
  },
  // ... rest of config
}
```

### 3. Performance Optimization

- Use CDN for static assets
- Enable gzip compression
- Set up proper caching headers
- Monitor Typesense performance
- Use connection pooling for high-traffic applications

## 📊 Monitoring & Analytics

The plugin provides callback hooks for custom analytics integration:

```tsx
<UnifiedSearchInput
  onSearch={(query) => {
    // Track search queries
    analytics.track('search_performed', { query })
  }}
  onResultClick={(result) => {
    // Track result clicks
    analytics.track('search_result_clicked', {
      resultId: result.document.id,
      collection: result.collection,
    })
  }}
  onResults={(results) => {
    // Track search performance
    analytics.track('search_completed', {
      resultCount: results.found,
      searchTime: results.search_time_ms,
    })
  }}
  onError={(error) => {
    // Track search errors
    analytics.track('search_error', { error })
  }}
/>
```

## 🐛 Troubleshooting

### Common Issues

1. **Search not working**: Check Typesense connection and API key
2. **No results returned**: Verify collection configuration and data sync
3. **Slow search**: Check Typesense performance and network latency
4. **CORS errors**: Ensure Typesense CORS is enabled
5. **"Unknown Collection" in results**: Verify collection metadata is properly configured
6. **Universal search not working**: Ensure the `/api/search` endpoint is accessible
7. **Collection categorization issues**: Check that `displayName` and `icon` are set in collection config
8. **Typesense data folder questions**: The `typesense-data` folder is created automatically by Typesense and is already in `.gitignore`. You don't need to create it manually.

### Debug Mode

Enable debug logging:

```typescript
// In development
console.log('Search debug:', {
  collections: await fetch('/api/search/collections').then((r) => r.json()),
  universalSearch: await fetch('/api/search?q=test').then((r) => r.json()),
  collectionSearch: await fetch('/api/search/posts?q=test').then((r) => r.json()),
})
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Typesense](https://typesense.org/) for the amazing search engine
- [Payload CMS](https://payloadcms.com/) for the flexible headless CMS
- [React](https://reactjs.org/) for the component framework
