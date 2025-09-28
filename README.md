# Typesense Search Plugin for Payload CMS

A powerful, production-ready search plugin that integrates Typesense with Payload CMS, providing lightning-fast, typo-tolerant search capabilities with real-time synchronization.

## 🚀 Quick Start

```bash
# 1. Install the plugin
pnpm add typesense-search-plugin

# 2. Start Typesense
docker run -p 8108:8108 -v/tmp/typesense-data:/data typesense/typesense:0.25.2 --data-dir /data --api-key=xyz --enable-cors

# 3. Add to your Payload config
```

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { typesenseSearch } from 'typesense-search-plugin'

export default buildConfig({
  plugins: [
    typesenseSearch({
      typesense: {
        apiKey: 'xyz',
        nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
      },
      collections: {
        posts: {
          enabled: true,
          searchFields: ['title', 'content'],
          facetFields: ['category', 'status'],
          displayName: 'Blog Posts',
          icon: '📝',
        },
      },
    }),
  ],
})
```

```tsx
// 4. Use the search component
import { HeadlessSearchInput } from 'typesense-search-plugin'

function SearchPage() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      placeholder="Search everything..."
      onResultClick={(result) => {
        console.log('Selected:', result.document)
      }}
    />
  )
}

// Multi-collection search
function MultiCollectionSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collections={['posts', 'products']}
      placeholder="Search posts & products..."
      onResultClick={(result) => {
        console.log('Selected:', result.document)
      }}
    />
  )
}

// Single collection search
function PostSearch() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collection="posts"
      placeholder="Search posts..."
      onResultClick={(result) => {
        console.log('Selected:', result.document)
      }}
    />
  )
}
```

## ✨ Features

- **⚡ Lightning Fast**: Sub-millisecond search response times
- **🔍 Flexible Search**: Single, multiple, or universal collection search with one component
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS
- **🎯 Smart API Selection**: Automatically chooses optimal endpoint for performance
- **🔄 Real-time Sync**: Automatic synchronization with Payload CMS
- **💾 Built-in Caching**: In-memory cache with configurable TTL
- **🛡️ Production Ready**: Comprehensive error handling and performance optimization
- **📱 Responsive**: Mobile-first design that works on all devices

## 📚 Documentation

For detailed documentation, visit our [comprehensive docs](https://fronttribe.github.io/typesense-search/):

- [Getting Started](https://fronttribe.github.io/typesense-search/guide/getting-started)
- [Installation Guide](https://fronttribe.github.io/typesense-search/guide/installation)
- [Configuration](https://fronttribe.github.io/typesense-search/guide/configuration)
- [API Reference](https://fronttribe.github.io/typesense-search/api/search)
- [Components](https://fronttribe.github.io/typesense-search/components/headless-search-input)
- [Customization](https://fronttribe.github.io/typesense-search/guide/customization)
- [Performance](https://fronttribe.github.io/typesense-search/guide/performance)
- [Troubleshooting](https://fronttribe.github.io/typesense-search/guide/troubleshooting)

## 🔧 API Endpoints

- `GET /api/search` - Universal search across all collections
- `GET /api/search/{collection}` - Search specific collection
- `POST /api/search/{collection}` - Advanced search with filters
- `GET /api/search/{collection}/suggest` - Search suggestions
- `GET /api/search/collections` - Collection metadata
- `GET /api/search/health` - Health check

## 🎨 Components

- **`HeadlessSearchInput`** - Single component supporting all search patterns:
  - **Single Collection**: `collection="posts"` - Direct API calls for optimal performance
  - **Multiple Collections**: `collections={['posts', 'products']}` - Smart filtering with universal search
  - **Universal Search**: No collection props - Search across all collections
  - **Complete UI Control**: Customizable rendering with modern Tailwind CSS styling

## 🆕 What's New in v1.3.0

- **🚀 Enhanced HeadlessSearchInput**: Now supports single, multiple, or universal collection search
- **🎯 Smart API Selection**: Automatically chooses the most efficient endpoint
- **🎨 Modern UI**: Beautiful Tailwind CSS styling with hover effects and animations
- **📊 Relative Scoring**: Meaningful percentage display for search result relevance
- **🔧 Simplified Architecture**: One component handles all search patterns
- **📱 Responsive Design**: Mobile-first approach with excellent UX
- **⚡ Performance**: Optimized with client-side filtering and efficient API calls

### Migration from v1.2.0

If you were using `UnifiedSearchInput`, simply replace it with `HeadlessSearchInput`:

```tsx
// Before (v1.2.0)
import { UnifiedSearchInput } from 'typesense-search-plugin'
<UnifiedSearchInput collections={['posts']} />

// After (v1.3.0)
import { HeadlessSearchInput } from 'typesense-search-plugin'
<HeadlessSearchInput collection="posts" />
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
