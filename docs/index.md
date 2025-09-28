---
layout: home

hero:
  name: 'Typesense Search Plugin'
  text: 'Lightning-fast search for Payload CMS'
  tagline: 'Powered by Typesense with real-time synchronization and typo tolerance'
  image:
    src: /logo.svg
    alt: Typesense Search Plugin
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/fronttribe/typesense-search

features:
  - icon: ⚡
    title: Lightning Fast
    details: Sub-millisecond search response times powered by Typesense's optimized search engine
  - icon: 🎯
    title: Accurate Results
    details: Precise matching with configurable typo tolerance and intelligent ranking
  - icon: 🔍
    title: Flexible Search
    details: Search single collections, multiple collections, or all collections with a single component and complete UI control
  - icon: 📱
    title: Responsive Design
    details: Mobile-first design that works perfectly on all devices and screen sizes
  - icon: 🔄
    title: Real-time Sync
    details: Automatic synchronization with Payload CMS changes for always up-to-date search
  - icon: 🛡️
    title: Production Ready
    details: Optimized for production with comprehensive error handling and performance monitoring
---

## Quick Start

Get up and running in minutes with our simple setup:

```bash
# Install the plugin
pnpm add typesense-search-plugin

# Add to your Payload config
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
          icon: '📝'
        },
        portfolio: {
          enabled: true,
          searchFields: ['title', 'description'],
          facetFields: ['status', 'featured'],
          displayName: 'Portfolio',
          icon: '💼'
        },
        products: {
          enabled: true,
          searchFields: ['name', 'description'],
          facetFields: ['category', 'inStock'],
          displayName: 'Products',
          icon: '🛍️'
        }
      }
    })
  ]
})
```

## Why Choose Typesense Search Plugin?

- **Zero Configuration**: Works out of the box with sensible defaults
- **TypeScript Native**: Full TypeScript support with comprehensive type definitions
- **Headless Components**: Single component supporting single, multiple, or universal collection search
- **Caching**: Built-in search result caching for optimal performance
- **Flexible**: Highly customizable search behavior and result rendering
- **Scalable**: Handles millions of documents with ease

## Community

Join our growing community of developers building amazing search experiences:

- [GitHub Repository](https://github.com/fronttribe/typesense-search)
- [Report Issues](https://github.com/fronttribe/typesense-search/issues)
- [NPM Package](https://www.npmjs.com/package/typesense-search-plugin)

---

<div class="text-center">
  <p class="text-lg opacity-70">
    Built with ❤️ by <a href="https://fronttribe.com" target="_blank">Front Tribe</a>
  </p>
</div>
