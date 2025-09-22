# Typesense Search Plugin for Payload CMS

A powerful, production-ready search plugin that integrates [Typesense](https://typesense.org/) with Payload CMS, providing fast, typo-tolerant search capabilities with real-time synchronization and a beautiful admin interface.

## 🚀 Features

- **🔍 Lightning-Fast Search**: Powered by Typesense for sub-millisecond search performance
- **🔄 Real-time Sync**: Automatically syncs Payload CMS collections with Typesense
- **🎯 Typo Tolerance**: Built-in typo tolerance and fuzzy matching for better user experience
- **🏷️ Faceted Search**: Support for faceted search and filtering by categories, status, etc.
- **🎨 Admin Interface**: Beautiful built-in search interface in Payload admin panel
- **🌐 RESTful API**: Complete search endpoints for frontend integration
- **📱 Responsive Design**: Mobile-first responsive design for all screen sizes
- **🔧 TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **✅ Production Ready**: Comprehensive testing, error handling, and performance optimization
- **🐳 Docker Support**: Easy setup with Docker Compose

## 📦 Installation

### Prerequisites

- **Node.js**: Version 22.19.0 or higher (see `.nvmrc` file)
- **Payload CMS**: Version 3.x
- **Typesense**: Version 0.25+ (or use Docker)
- **Docker and Docker Compose** (for Typesense)

### 1. Setup Node.js Version

```bash
# Use the correct Node.js version (if using nvm)
nvm use

# Or install Node.js 22.19.0+ manually
```

### 2. Install Dependencies

```bash
# Install the plugin
pnpm install typesense-search

# Install Typesense client
pnpm install typesense
```

### 3. Set Up Typesense Server

```bash
# Start Typesense with Docker Compose
docker-compose up -d

# Verify it's running
curl http://localhost:8108/health
# Should return: {"ok":true}
```

### 4. Configure the Plugin

Add the plugin to your Payload configuration:

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { typesenseSearch } from 'typesense-search'

export default buildConfig({
  // ... your existing config
  plugins: [
    typesenseSearch({
      typesense: {
        nodes: [
          {
            host: 'localhost',
            port: 8108,
            protocol: 'http',
          },
        ],
        apiKey: 'xyz', // Change this in production
        connectionTimeoutSeconds: 2,
      },
      collections: {
        posts: {
          enabled: true,
          searchFields: ['title', 'content'],
          facetFields: ['category', 'status'],
        },
        media: {
          enabled: true,
          searchFields: ['filename', 'alt'],
          facetFields: ['type'],
        },
      },
      settings: {
        autoSync: true,
        searchEndpoint: '/api/search',
      },
    }),
  ],
})
```

## 🔧 Configuration Options

### Typesense Configuration

```typescript
typesense: {
  nodes: Array<{
    host: string
    port: string | number
    protocol: 'http' | 'https'
  }>
  apiKey: string
  connectionTimeoutSeconds?: number // Default: 2
}
```

### Collection Configuration

```typescript
collections: {
  [collectionSlug]: {
    enabled: boolean
    searchFields?: string[]      // Fields to search in
    facetFields?: string[]       // Fields for faceting/filtering
    sortFields?: string[]        // Fields available for sorting
  }
}
```

### Plugin Settings

```typescript
settings: {
  autoSync?: boolean             // Enable/disable auto-sync (default: true)
  batchSize?: number            // Batch size for syncing (default: 100)
  searchEndpoint?: string       // Custom search endpoint path (default: '/api/search')
}
```

## 🔍 Search API Endpoints

The plugin provides comprehensive search endpoints that can be used from your frontend or other services.

### Basic Search

```http
GET /api/search/{collection}?q={query}&page={page}&per_page={per_page}
```

**Example:**

```bash
curl "http://localhost:3000/api/search/posts?q=typesense&per_page=5"
```

### Advanced Search with POST

```http
POST /api/search/{collection}
Content-Type: application/json

{
  "q": "search query",
  "query_by": "title,content",
  "filter_by": "category:=news",
  "sort_by": "createdAt:desc",
  "per_page": 10,
  "page": 1,
  "highlight_full_fields": "title,content",
  "snippet_threshold": 30,
  "num_typos": 2
}
```

### Search Suggestions

```http
GET /api/search/{collection}/suggest?q={query}&limit={limit}
```

**Example:**

```bash
curl "http://localhost:3000/api/search/posts/suggest?q=typ&limit=3"
```

## 🎨 Admin Interface

The plugin automatically adds a beautiful search interface to your Payload admin panel:

- **📊 Collection Statistics**: Real-time document counts and field information
- **🔍 Search Interface**: Live search with collection selector
- **✨ Search Results**: Highlighted results with snippets
- **💡 Suggestions**: Auto-complete suggestions as you type
- **📱 Responsive**: Works perfectly on all devices

## 🧪 Testing

### Run All Tests

```bash
# Run integration and E2E tests
pnpm test

# Run only integration tests
pnpm test:int

# Run only E2E tests
pnpm test:e2e
```

### Test Typesense Connection

```bash
# Test Typesense connection and basic functionality
npx tsx dev/test-typesense.ts
```

## 🚀 Development

### Start Development Environment

```bash
# Start Typesense
docker-compose up -d

# Start Payload CMS development server
pnpm dev
```

### Build Plugin

```bash
# Build the plugin for production
pnpm build
```

## 📁 Project Structure

```
src/
├── index.ts                           # Main plugin entry point
├── lib/
│   ├── typesense-client.ts            # Typesense client setup
│   ├── schema-mapper.ts               # Collection schema mapping
│   ├── hooks.ts                      # Auto-sync hooks
│   └── initialization.ts             # Collection initialization
├── endpoints/
│   ├── search.ts                     # Search API endpoints
│   └── customEndpointHandler.ts      # Custom endpoint example
├── components/
│   ├── BeforeDashboardClient.tsx     # Client-side search UI
│   ├── BeforeDashboardServer.tsx     # Server-side statistics
│   └── BeforeDashboardServer.module.css
└── exports/
    ├── client.ts                     # Client exports
    └── rsc.ts                        # RSC exports
```

## 🔄 How It Works

1. **🚀 Initialization**: Plugin creates Typesense collections based on your Payload collections
2. **🔄 Auto-Sync**: Hooks automatically sync data when documents are created/updated/deleted
3. **🔍 Search**: Provides RESTful search endpoints that query Typesense
4. **🎨 Admin UI**: Built-in search interface appears in your Payload admin panel
5. **⚡ Performance**: Optimized for speed with caching and efficient queries

## 🛠️ Customization

### Custom Search Fields

```typescript
collections: {
  posts: {
    enabled: true,
    searchFields: ['title', 'content', 'excerpt', 'tags'],
    facetFields: ['category', 'status', 'author', 'publishedAt']
  }
}
```

### Custom Search Parameters

```typescript
// Frontend integration example
const searchResults = await fetch('/api/search/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    q: 'search query',
    query_by: 'title,content',
    filter_by: 'status:=published',
    sort_by: 'createdAt:desc',
    highlight_full_fields: 'title,content',
    snippet_threshold: 30,
    num_typos: 2,
  }),
})
```

### Custom Styling

The admin interface uses CSS modules for easy customization:

```css
/* Override styles in your admin CSS */
.typesense-search-wrapper {
  /* Your custom styles */
}
```

## 🐛 Troubleshooting

### Typesense Connection Issues

1. **Check if Typesense is running:**

   ```bash
   docker-compose ps
   curl http://localhost:8108/health
   ```

2. **Verify API key in configuration**
3. **Check network connectivity**

### Sync Issues

1. **Check console logs for sync errors**
2. **Verify collection configuration**
3. **Test with manual sync**

### Search Issues

1. **Verify search fields are configured correctly**
2. **Check if documents are synced to Typesense**
3. **Test search endpoints directly**

### Node.js Version Issues

- **Requirement**: Node.js 18+ for full Next.js compatibility
- **Current**: If using Node.js 16, core functionality works but development server may not start

## 📊 Performance

- **Search Speed**: Sub-millisecond search responses
- **Memory Usage**: Optimized for minimal memory footprint
- **Scalability**: Handles thousands of documents efficiently
- **Caching**: Built-in caching for better performance

## 🔒 Security

- **API Key Protection**: Secure API key handling
- **Input Validation**: Comprehensive input validation
- **Error Handling**: Secure error handling without data leakage
- **CORS Support**: Configurable CORS settings

## 📚 Resources

- [Typesense Documentation](https://typesense.org/docs/)
- [Payload CMS Plugins](https://payloadcms.com/docs/plugins/overview)
- [Typesense JavaScript Client](https://github.com/typesense/typesense-js)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run tests (`pnpm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Typesense](https://typesense.org/) for the amazing search engine
- [Payload CMS](https://payloadcms.com/) for the excellent headless CMS
- [Next.js](https://nextjs.org/) for the powerful React framework

---

**Made with ❤️ for the Payload CMS community**
