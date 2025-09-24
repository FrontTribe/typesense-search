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
import { UnifiedSearchInput } from 'typesense-search-plugin'

function SearchPage() {
  return (
    <UnifiedSearchInput
      baseUrl="http://localhost:3000"
      placeholder="Search everything..."
      onResultClick={(result) => {
        console.log('Selected:', result.document)
      }}
    />
  )
}
```

## ✨ Features

- **⚡ Lightning Fast**: Sub-millisecond search response times
- **🔍 Universal Search**: Search across all collections simultaneously
- **🎨 Customizable**: Ready-to-use and headless React components
- **🔄 Real-time Sync**: Automatic synchronization with Payload CMS
- **💾 Built-in Caching**: In-memory cache with configurable TTL
- **🛡️ Production Ready**: Error handling and performance optimization

## 📚 Documentation

For detailed documentation, visit our [comprehensive docs](https://fronttribe.github.io/typesense-search/):

- [Getting Started](https://fronttribe.github.io/typesense-search/guide/getting-started)
- [Installation Guide](https://fronttribe.github.io/typesense-search/guide/installation)
- [Configuration](https://fronttribe.github.io/typesense-search/guide/configuration)
- [API Reference](https://fronttribe.github.io/typesense-search/api/search)
- [Components](https://fronttribe.github.io/typesense-search/components/unified-search-input)
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

- **`UnifiedSearchInput`** - Ready-to-use search component
- **`HeadlessSearchInput`** - Headless component for full control

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
