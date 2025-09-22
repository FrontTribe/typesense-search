# Typesense Search Plugin for Payload CMS

A powerful search plugin that integrates [Typesense](https://typesense.org/) with Payload CMS, providing fast, typo-tolerant search capabilities with real-time synchronization.

## 🚀 Features

- **Real-time Sync**: Automatically syncs Payload CMS collections with Typesense
- **Typo Tolerance**: Built-in typo tolerance and fuzzy matching
- **Faceted Search**: Support for faceted search and filtering
- **Admin Interface**: Built-in search interface in Payload admin panel
- **RESTful API**: Search endpoints for frontend integration
- **TypeScript Support**: Full TypeScript support with type definitions
- **Comprehensive Testing**: Unit, integration, and E2E tests included

## 📦 Installation

1. **Install the plugin dependencies:**

   ```bash
   pnpm install typesense
   ```

2. **Set up Typesense server** (using Docker Compose):

   ```bash
   # Start Typesense
   docker-compose up -d

   # Verify it's running
   curl http://localhost:8108/health
   ```

3. **Configure the plugin in your Payload config:**

   ```typescript
   import { typesenseSearch } from 'typesense-search'

   export default buildConfig({
     // ... your config
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
           apiKey: 'xyz',
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
  connectionTimeoutSeconds?: number
}
```

### Collection Configuration

```typescript
collections: {
  [collectionSlug]: {
    enabled: boolean
    searchFields?: string[]      // Fields to search in
    facetFields?: string[]       // Fields for faceting
    sortFields?: string[]        // Fields for sorting
  }
}
```

### Plugin Settings

```typescript
settings: {
  autoSync?: boolean             // Enable/disable auto-sync (default: true)
  batchSize?: number            // Batch size for syncing (default: 100)
  searchEndpoint?: string       // Custom search endpoint path
}
```

## 🔍 Search API Endpoints

### Basic Search

```http
GET /api/search/{collection}?q={query}&page={page}&per_page={per_page}
```

### Advanced Search

```http
POST /api/search/{collection}
Content-Type: application/json

{
  "q": "search query",
  "query_by": "title,content",
  "filter_by": "category:=news",
  "sort_by": "created_at:desc",
  "per_page": 10,
  "page": 1
}
```

### Search Suggestions

```http
GET /api/search/{collection}/suggest?q={query}&limit={limit}
```

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

### Run Integration Tests Only

```bash
pnpm test:int
```

### Run E2E Tests Only

```bash
pnpm test:e2e
```

### Test Typesense Connection

```bash
npx tsx dev/test-typesense.ts
```

## 🚀 Development

### Start Development Environment

```bash
# Start Typesense
docker-compose up -d

# Start Payload CMS
pnpm dev
```

### Build Plugin

```bash
pnpm build
```

## 📁 Project Structure

```
src/
├── index.ts                    # Main plugin entry point
├── lib/
│   ├── typesense-client.ts     # Typesense client setup
│   ├── schema-mapper.ts        # Collection schema mapping
│   ├── hooks.ts               # Auto-sync hooks
│   └── initialization.ts      # Collection initialization
├── endpoints/
│   ├── search.ts              # Search API endpoints
│   └── customEndpointHandler.ts
├── components/
│   ├── BeforeDashboardClient.tsx  # Client-side search UI
│   ├── BeforeDashboardServer.tsx  # Server-side stats
│   └── BeforeDashboardServer.module.css
└── exports/
    ├── client.ts              # Client exports
    └── rsc.ts                 # RSC exports
```

## 🔄 How It Works

1. **Initialization**: Plugin creates Typesense collections based on Payload collections
2. **Auto-Sync**: Hooks automatically sync data when documents are created/updated/deleted
3. **Search**: Provides RESTful search endpoints that query Typesense
4. **Admin UI**: Built-in search interface in Payload admin panel

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
// In your frontend
const searchResults = await fetch('/api/search/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    q: 'search query',
    query_by: 'title,content',
    filter_by: 'status:=published',
    sort_by: 'created_at:desc',
    highlight_full_fields: 'title,content',
    snippet_threshold: 30,
    num_typos: 2,
  }),
})
```

## 🐛 Troubleshooting

### Typesense Connection Issues

1. Ensure Typesense is running: `docker-compose ps`
2. Check health: `curl http://localhost:8108/health`
3. Verify API key in configuration

### Sync Issues

1. Check console logs for sync errors
2. Verify collection configuration
3. Test with manual sync

### Search Issues

1. Verify search fields are configured correctly
2. Check if documents are synced to Typesense
3. Test search endpoints directly

## 📚 Resources

- [Typesense Documentation](https://typesense.org/docs/)
- [Payload CMS Plugins](https://payloadcms.com/docs/plugins/overview)
- [Typesense JavaScript Client](https://github.com/typesense/typesense-js)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
