# Typesense Search Plugin for Payload CMS

A powerful, production-ready search plugin that integrates Typesense with Payload CMS, providing lightning-fast, typo-tolerant search capabilities with real-time synchronization.

## 🚀 Features

- **⚡ Lightning Fast**: Sub-millisecond search response times powered by Typesense
- **🎯 Accurate Results**: Precise matching with configurable typo tolerance
- **🔍 Multi-Collection**: Search across multiple collections simultaneously
- **📱 Responsive Design**: Mobile-first design that works on all devices
- **🎨 Customizable**: Fully customizable UI, search behavior, and result rendering
- **🔄 Real-time Sync**: Automatic synchronization with Payload CMS changes
- **📊 Analytics**: Built-in search statistics and analytics
- **🛡️ Production Ready**: Optimized for production with error handling and performance monitoring

## 📦 Installation

```bash
npm install typesense-search
# or
yarn add typesense-search
# or
pnpm add typesense-search
```

## 🏗️ Setup

### 1. Install Typesense

```bash
# Using Docker (recommended)
docker run -p 8108:8108 -v/tmp/typesense-data:/data typesense/typesense:0.25.2 --data-dir /data --api-key=xyz --enable-cors

# Or install locally
# See: https://typesense.org/docs/guide/install-typesense.html
```

### 2. Configure Payload CMS

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { typesenseSearch } from 'typesense-search'

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
      },
    }),
  ],
})
```

### 3. Use the Search Components

```tsx
// pages/search.tsx
import { UnifiedSearchInput } from 'typesense-search'

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

  return (
    <div>
      <h1>Search</h1>
      <UnifiedSearchInput
        baseUrl="http://localhost:3000"
        placeholder="Search everything..."
        onResultClick={handleResultClick}
        onSearch={handleSearch}
        onResults={handleResults}
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
  renderResult?: (hit: SearchHit, index: number) => React.ReactNode
  renderNoResults?: (query: string) => React.ReactNode
  renderLoading?: () => React.ReactNode
}
```

## 🔧 API Endpoints

The plugin automatically creates the following API endpoints:

- `GET /api/search/collections` - Get available collections
- `GET /api/search/{collection}?q={query}` - Search a specific collection
- `POST /api/search/{collection}` - Advanced search with filters

### Example API Usage

```typescript
// Get collections
const collections = await fetch('/api/search/collections').then((r) => r.json())

// Search posts
const results = await fetch('/api/search/posts?q=typescript&per_page=10').then((r) => r.json())

// Advanced search
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

The plugin includes built-in analytics:

- Search query tracking
- Result click tracking
- Search performance metrics
- Error monitoring

Access analytics through the component callbacks:

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
      collection: result.document._collection,
    })
  }}
  onResults={(results) => {
    // Track search performance
    analytics.track('search_completed', {
      query: results.query,
      resultCount: results.found,
      searchTime: results.search_time_ms,
    })
  }}
/>
```

## 🐛 Troubleshooting

### Common Issues

1. **Search not working**: Check Typesense connection and API key
2. **No results returned**: Verify collection configuration and data sync
3. **Slow search**: Check Typesense performance and network latency
4. **CORS errors**: Ensure Typesense CORS is enabled

### Debug Mode

Enable debug logging:

```typescript
// In development
console.log('Search debug:', {
  collections: await fetch('/api/search/collections').then((r) => r.json()),
  searchResults: await fetch('/api/search/posts?q=test').then((r) => r.json()),
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

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](https://discord.gg/example)
- 📖 Documentation: [docs.example.com](https://docs.example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/example/typesense-search/issues)
