# Getting Started

Welcome to the Typesense Search Plugin for Payload CMS! This guide will help you get up and running quickly.

## What is Typesense Search Plugin?

The Typesense Search Plugin is a powerful, production-ready search solution that integrates Typesense with Payload CMS. It provides:

- **Lightning-fast search** with sub-millisecond response times
- **Typo tolerance** and intelligent ranking
- **Flexible search patterns** - single collection, multiple collections, or all collections
- **Real-time synchronization** with Payload CMS
- **Single React component** supporting all search patterns with complete UI control
- **Built-in caching** for optimal performance

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 22.19.0+ or 20.9.0+
- **Payload CMS** 3.64.0+
- **Typesense** 0.25.2+
- **pnpm** (recommended) or npm/yarn

## Installation

### 1. Install the Plugin

```bash
# Using pnpm (recommended)
pnpm add typesense-search-plugin

# Using npm
npm install typesense-search-plugin

# Using yarn
yarn add typesense-search-plugin
```

### 2. Set Up Typesense

#### Option A: Docker Compose (Recommended)

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'
services:
  typesense:
    image: typesense/typesense:0.25.2
    ports:
      - '8108:8108'
    volumes:
      - ./typesense-data:/data
    command: '--data-dir /data --api-key=xyz --enable-cors'
```

Then run:

```bash
docker-compose up -d
```

#### Option B: Manual Docker Setup

```bash
docker run -p 8108:8108 \
  -v $(pwd)/typesense-data:/data \
  typesense/typesense:0.25.2 \
  --data-dir /data \
  --api-key=xyz \
  --enable-cors
```

### 3. Configure Payload CMS

Add the plugin to your Payload configuration:

```typescript
import { buildConfig } from 'payload/config'
import { typesenseSearch } from 'typesense-search-plugin'

export default buildConfig({
  // ... your existing config
  plugins: [
    typesenseSearch({
      typesense: {
        apiKey: 'xyz',
        nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
      },
      collections: {
        // Configure your collections here
      },
    }),
  ],
})
```

## Next Steps

Now that you have the basics set up, you can:

1. [Configure your collections](/guide/configuration) for search
2. [Add React components](/components/headless-search-input) to your UI
3. [Explore the API](/api/search) for advanced usage
4. [Customize the search behavior](/guide/customization)

## Need Help?

If you run into any issues:

1. Check the [Troubleshooting guide](/guide/troubleshooting)
2. Look at the [API documentation](/api/search)
3. [Report an issue](https://github.com/fronttribe/typesense-search/issues) on GitHub

Happy searching! 🚀
