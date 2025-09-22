# Typesense Search Plugin for Payload CMS

[![npm version](https://img.shields.io/npm/v/typesense-search.svg)](https://www.npmjs.com/package/typesense-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Payload CMS](https://img.shields.io/badge/Payload%20CMS-3.x-green.svg)](https://payloadcms.com/)

A powerful, production-ready search plugin that integrates [Typesense](https://typesense.org/) with Payload CMS, providing lightning-fast, typo-tolerant search capabilities with real-time synchronization and a beautiful admin interface.

> **Built by [Front Tribe](https://fronttribe.com)** - We create powerful tools for modern web development.

## ✨ Features

- **🔍 Lightning-Fast Search**: Powered by Typesense for sub-millisecond search performance
- **🔄 Real-time Sync**: Automatically syncs Payload CMS collections with Typesense on create/update/delete
- **🎯 Typo Tolerance**: Built-in typo tolerance and fuzzy matching for better user experience
- **🏷️ Faceted Search**: Support for faceted search and filtering by categories, status, etc.
- **📝 RichText Support**: Properly extracts and indexes content from Payload's richText fields
- **🎨 Admin Interface**: Beautiful built-in search interface in Payload admin panel
- **🌐 RESTful API**: Complete search endpoints for frontend integration
- **📱 Responsive Design**: Mobile-first responsive design for all screen sizes
- **🔧 TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **✅ Production Ready**: Comprehensive error handling, graceful fallbacks, and performance optimization
- **🐳 Docker Support**: Easy setup with Docker Compose
- **🔄 Auto-Sync**: Automatic collection creation and schema management

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 22.19.0 or higher (see `.nvmrc` file)
- **Payload CMS**: Version 3.x
- **Typesense**: Version 0.25+ (or use Docker)
- **Package Manager**: pnpm (recommended)

### 1. Install the Plugin

```bash
# Using pnpm (recommended)
pnpm add @fronttribe/typesense-search typesense

# Using npm
npm install @fronttribe/typesense-search typesense

# Using yarn
yarn add @fronttribe/typesense-search typesense
```

### 2. Set Up Typesense Server

```bash
# Start Typesense with Docker Compose
docker-compose up -d

# Verify it's running
curl http://localhost:8108/health
# Should return: {"ok":true}
```

### 3. Configure the Plugin

Add the plugin to your Payload configuration:

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { typesenseSearch } from '@fronttribe/typesense-search'

export default buildConfig({
  // ... your existing config
  plugins: [
    typesenseSearch({
      typesense: {
        apiKey: 'your-api-key',
        nodes: [
          {
            host: 'localhost',
            port: 8108,
            protocol: 'http',
          },
        ],
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

### 4. Start Your Application

```bash
# Using pnpm
pnpm dev

# Using npm
npm run dev

# Using yarn
yarn dev
```

That's it! Your search functionality is now ready to use.

## 📖 Usage

### Basic Search

```typescript
// Search posts
const response = await fetch('/api/search/posts?q=your search query')
const results = await response.json()

console.log(`Found ${results.found} results in ${results.search_time_ms}ms`)
```

### Advanced Search

```typescript
// Advanced search with filters and pagination
const searchParams = new URLSearchParams({
  q: 'typescript',
  page: '1',
  per_page: '10',
  category: 'programming',
  status: 'published',
  sort_by: 'createdAt:desc',
})

const response = await fetch(`/api/search/posts?${searchParams}`)
const results = await response.json()
```

### Headless Search Component

```tsx
import HeadlessSearchInput from '@fronttribe/typesense-search'

function MySearchPage() {
  const handleResultClick = (result) => {
    console.log('Result clicked:', result)
    // Navigate to result page or show details
  }

  return (
    <div>
      <h1>Search Our Content</h1>
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        placeholder="Search posts..."
        onResultClick={handleResultClick}
        debounceMs={300}
        minQueryLength={2}
        perPage={10}
      />
    </div>
  )
}
```

## 🔧 Configuration

### Plugin Options

```typescript
interface TypesenseSearchConfig {
  typesense: {
    nodes: Array<{
      host: string
      port: string | number
      protocol: 'http' | 'https'
    }>
    apiKey: string
    connectionTimeoutSeconds?: number
  }
  collections?: Partial<
    Record<
      CollectionSlug,
      {
        enabled: boolean
        searchFields?: string[]
        facetFields?: string[]
        sortFields?: string[]
      }
    >
  >
  settings?: {
    autoSync?: boolean
    batchSize?: number
    searchEndpoint?: string
  }
  disabled?: boolean
}
```

### Collection Configuration

```typescript
collections: {
  posts: {
    enabled: true,                    // Enable search for this collection
    searchFields: ['title', 'content'], // Fields to search in
    facetFields: ['category', 'status'], // Fields for faceted search
    sortFields: ['createdAt', 'title']   // Fields available for sorting
  }
}
```

## 🎨 Admin Interface

The plugin automatically adds a beautiful search interface to your Payload admin panel:

- **Real-time search** with instant results
- **Faceted filtering** by categories and status
- **Search statistics** and performance metrics
- **Responsive design** for all screen sizes
- **Keyboard navigation** support

## 🌐 API Endpoints

### Search Endpoints

| Endpoint                          | Method | Description                        |
| --------------------------------- | ------ | ---------------------------------- |
| `/api/search/:collection`         | GET    | Basic search with query parameters |
| `/api/search/:collection`         | POST   | Advanced search with JSON body     |
| `/api/search/:collection/suggest` | GET    | Search suggestions/autocomplete    |

### Query Parameters

| Parameter   | Type   | Description                                           |
| ----------- | ------ | ----------------------------------------------------- |
| `q`         | string | Search query (required)                               |
| `page`      | number | Page number (default: 1)                              |
| `per_page`  | number | Results per page (default: 10)                        |
| `sort_by`   | string | Sort field and direction (e.g., `createdAt:desc`)     |
| `filter_by` | string | Filter by field value (e.g., `category:=programming`) |

### Response Format

```typescript
interface SearchResponse {
  found: number
  search_time_ms: number
  hits: Array<{
    document: {
      id: string
      title: string
      content: string
      // ... other fields
    }
    highlight: {
      [field: string]: string
    }
  }>
  facet_counts: Array<{
    field_name: string
    counts: Array<{
      count: number
      highlighted: string
      value: string
    }>
  }>
}
```

## 🔄 Real-time Synchronization

The plugin automatically syncs your Payload CMS data with Typesense:

- **Create**: New documents are automatically indexed
- **Update**: Modified documents are automatically updated
- **Delete**: Deleted documents are automatically removed
- **RichText**: Content from richText fields is properly extracted
- **Error Handling**: Graceful handling of sync errors and missing collections

## 🛠️ Development

### Prerequisites

- Node.js 22.19.0+
- pnpm
- Docker and Docker Compose

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/typesense-search.git
cd typesense-search

# Install dependencies
pnpm install

# Start Typesense
docker-compose up -d

# Start development server
cd dev
pnpm dev
```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run integration tests
pnpm test:integration
```

## 🐳 Docker Support

The plugin includes Docker Compose configuration for easy Typesense setup:

```yaml
# docker-compose.yml
version: '3.8'
services:
  typesense:
    image: typesense/typesense:0.25.1
    ports:
      - '8108:8108'
    volumes:
      - typesense-data:/data
    command: '--data-dir /data --api-key=xyz --enable-cors'
    environment:
      - TYPESENSE_DATA_DIR=/data

volumes:
  typesense-data:
```

## 📊 Performance

- **Sub-millisecond search** response times
- **Typo tolerance** with configurable thresholds
- **Fuzzy matching** for better search results
- **Faceted search** for efficient filtering
- **Pagination** for large result sets
- **Caching** for improved performance

## 🔒 Security

- **API key authentication** for Typesense
- **Input validation** and sanitization
- **Error handling** without exposing sensitive information
- **Rate limiting** support (configure in your application)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Typesense](https://typesense.org/) for the amazing search engine
- [Payload CMS](https://payloadcms.com/) for the excellent headless CMS
- All contributors who help make this plugin better

## 📞 Support

- **Documentation**: [Full Documentation](https://github.com/fronttribe/typesense-search/wiki)
- **Issues**: [GitHub Issues](https://github.com/fronttribe/typesense-search/issues)
- **Discussions**: [GitHub Discussions](https://github.com/fronttribe/typesense-search/discussions)
- **Website**: [Front Tribe](https://fronttribe.com)

## 🗺️ Roadmap

- [ ] **v1.1.0**: Advanced search filters and sorting
- [ ] **v1.2.0**: Search analytics and insights
- [ ] **v1.3.0**: Multi-language support
- [ ] **v1.4.0**: Search result ranking customization
- [ ] **v2.0.0**: GraphQL support

---

Made with ❤️ by [Front Tribe](https://fronttribe.com) for the Payload CMS community
