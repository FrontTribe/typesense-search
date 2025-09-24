# Quick Start

Get up and running with the Typesense Search Plugin in just a few minutes.

## Prerequisites

- Node.js 22.19.0+ or 20.9.0+
- Payload CMS 3.37.0+
- Typesense 0.25.2+

## 1. Install the Plugin

```bash
pnpm add typesense-search-plugin
```

## 2. Start Typesense

```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or manually with Docker
docker run -p 8108:8108 \
  -v $(pwd)/typesense-data:/data \
  typesense/typesense:0.25.2 \
  --data-dir /data \
  --api-key=xyz \
  --enable-cors
```

## 3. Add to Payload Config

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
      },
      collections: {
        posts: {
          enabled: true,
          searchFields: ['title', 'content'],
          facetFields: ['category', 'status'],
          displayName: 'Blog Posts',
          icon: '📝'
        }
      }
    })
  ]
})
```

## 4. Add Search Component

```tsx
// pages/search.tsx
import { UnifiedSearchInput } from 'typesense-search-plugin'

export default function SearchPage() {
  return (
    <div className="search-page">
      <h1>Search</h1>
      <UnifiedSearchInput
        baseUrl="http://localhost:3000"
        placeholder="Search everything..."
        onResultClick={(result) => {
          console.log('Selected:', result.document)
        }}
      />
    </div>
  )
}
```

## 5. Test the Search

1. Start your Payload CMS development server
2. Visit the search page
3. Type a search query
4. See results appear in real-time!

## What's Next?

- [Configuration Guide](/guide/configuration) - Learn about all configuration options
- [API Reference](/api/search) - Explore the search API
- [Components](/components/unified-search-input) - Learn about React components
- [Customization](/guide/customization) - Customize the search experience

## Troubleshooting

If you run into issues:

1. Check that Typesense is running: `curl http://localhost:8108/health`
2. Verify your Payload config is correct
3. Check the browser console for errors
4. See the [Troubleshooting Guide](/guide/troubleshooting)

## Example: Complete Setup

Here's a complete example with a blog setup:

```typescript
// payload.config.ts
import { buildConfig } from 'payload/config'
import { typesenseSearch } from 'typesense-search-plugin'

export default buildConfig({
  collections: [
    {
      slug: 'posts',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true
        },
        {
          name: 'content',
          type: 'richText',
          required: true
        },
        {
          name: 'category',
          type: 'select',
          options: ['tech', 'tutorial', 'news']
        },
        {
          name: 'status',
          type: 'select',
          options: ['draft', 'published'],
          defaultValue: 'draft'
        }
      ]
    }
  ],
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
        }
      }
    })
  ]
})
```

```tsx
// components/SearchBox.tsx
import { UnifiedSearchInput } from 'typesense-search-plugin'

export function SearchBox() {
  return (
    <UnifiedSearchInput
      baseUrl={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
      placeholder="Search posts..."
      onResultClick={(result) => {
        // Navigate to the post
        window.location.href = `/posts/${result.document.slug}`
      }}
      renderResult={(hit) => (
        <div className="search-result">
          <h3>{hit.document.title}</h3>
          <p>{hit.document.excerpt}</p>
          <span className="category">{hit.document.category}</span>
        </div>
      )}
    />
  )
}
```

That's it! You now have a fully functional search system. 🎉
