# Configuration

The Typesense Search Plugin can be configured with various options to customize its behavior.

## Basic Configuration

```typescript
import { typesenseSearch } from '@fronttribe/typesense-search'

const config = {
  // ... your Payload config
  plugins: [
    typesenseSearch({
      typesense: {
        apiKey: 'your-typesense-api-key',
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
      },
    }),
  ],
}
```

## Configuration Options

### Typesense Configuration

| Option                     | Type                                                               | Required | Default | Description                   |
| -------------------------- | ------------------------------------------------------------------ | -------- | ------- | ----------------------------- |
| `apiKey`                   | `string`                                                           | ✅       | -       | Typesense API key             |
| `nodes`                    | `Array<{host: string, port: number, protocol: 'http' \| 'https'}>` | ✅       | -       | Typesense server nodes        |
| `connectionTimeoutSeconds` | `number`                                                           | ❌       | `10`    | Connection timeout in seconds |
| `numRetries`               | `number`                                                           | ❌       | `3`     | Number of retry attempts      |
| `retryIntervalSeconds`     | `number`                                                           | ❌       | `1`     | Retry interval in seconds     |

### Collection Configuration

| Option         | Type       | Required | Default                               | Description                                  |
| -------------- | ---------- | -------- | ------------------------------------- | -------------------------------------------- |
| `enabled`      | `boolean`  | ❌       | `true`                                | Whether the collection is enabled for search |
| `displayName`  | `string`   | ❌       | Collection slug                       | Human-readable name for the collection       |
| `searchFields` | `string[]` | ❌       | `['title', 'content', 'description']` | Fields to search in                          |
| `facetFields`  | `string[]` | ❌       | `[]`                                  | Fields to use for faceting                   |
| `icon`         | `string`   | ❌       | `'📄'`                                | Icon for the collection in search results    |
| `sortFields`   | `string[]` | ❌       | `[]`                                  | Available sort fields                        |

### Global Settings

| Option                    | Type      | Required | Default       | Description                               |
| ------------------------- | --------- | -------- | ------------- | ----------------------------------------- |
| `disabled`                | `boolean` | ❌       | `false`       | Disable the entire plugin                 |
| `settings.autoSync`       | `boolean` | ❌       | `true`        | Automatically sync documents to Typesense |
| `settings.batchSize`      | `number`  | ❌       | `100`         | Batch size for bulk operations            |
| `settings.categorized`    | `boolean` | ❌       | `false`       | Group results by collection               |
| `settings.searchEndpoint` | `string`  | ❌       | `/api/search` | Custom search endpoint path               |

## Complete Configuration Example

```typescript
import { typesenseSearch } from '@fronttribe/typesense-search'

const config = {
  // ... your Payload config
  plugins: [
    typesenseSearch({
      // Disable plugin (useful for development)
      disabled: false,

      // Typesense server configuration
      typesense: {
        apiKey: process.env.TYPESENSE_API_KEY,
        nodes: [
          {
            host: process.env.TYPESENSE_HOST || 'localhost',
            port: parseInt(process.env.TYPESENSE_PORT || '8108'),
            protocol: (process.env.TYPESENSE_PROTOCOL as 'http' | 'https') || 'http',
          },
        ],
        connectionTimeoutSeconds: 10,
        numRetries: 3,
        retryIntervalSeconds: 1,
      },

      // Collection configurations
      collections: {
        posts: {
          enabled: true,
          displayName: 'Blog Posts',
          searchFields: ['title', 'content', 'excerpt'],
          facetFields: ['category', 'status', 'author'],
          icon: '📝',
          sortFields: ['createdAt', 'updatedAt', 'title'],
        },
        pages: {
          enabled: true,
          displayName: 'Pages',
          searchFields: ['title', 'content'],
          facetFields: ['template'],
          icon: '📄',
          sortFields: ['title', 'createdAt'],
        },
        media: {
          enabled: false, // Disabled for search
          displayName: 'Media Files',
          searchFields: ['filename', 'alt'],
          facetFields: ['type'],
          icon: '🖼️',
        },
      },

      // Global settings
      settings: {
        autoSync: true,
        batchSize: 100,
        categorized: false,
        searchEndpoint: '/api/search',
      },
    }),
  ],
}
```

## Environment Variables

For production deployments, use environment variables:

```bash
# .env
TYPESENSE_API_KEY=your-typesense-api-key
TYPESENSE_HOST=your-typesense-host
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=https
```

```typescript
const config = {
  plugins: [
    typesenseSearch({
      typesense: {
        apiKey: process.env.TYPESENSE_API_KEY!,
        nodes: [
          {
            host: process.env.TYPESENSE_HOST!,
            port: parseInt(process.env.TYPESENSE_PORT!),
            protocol: process.env.TYPESENSE_PROTOCOL as 'http' | 'https',
          },
        ],
      },
      collections: {
        // ... collection configs
      },
    }),
  ],
}
```

## Collection Field Mapping

The plugin automatically maps Payload fields to Typesense fields. Supported field types:

- **Text fields**: `text`, `textarea`, `richText`
- **Number fields**: `number`
- **Date fields**: `date`, `dateTime`
- **Boolean fields**: `checkbox`
- **Array fields**: `array` (flattened)
- **Relationship fields**: `relationship` (ID only)

### Custom Field Mapping

```typescript
collections: {
  posts: {
    enabled: true,
    searchFields: ['title', 'content', 'author.name'], // Nested field access
    facetFields: ['category', 'status']
  }
}
```

## Search Field Configuration

### Basic Search Fields

```typescript
collections: {
  posts: {
    searchFields: ['title', 'content', 'excerpt']
  }
}
```

### Nested Field Access

```typescript
collections: {
  posts: {
    searchFields: [
      'title',
      'content',
      'author.name', // Nested object field
      'tags.name', // Array of objects
      'metadata.description', // Deep nesting
    ]
  }
}
```

### Facet Fields

Facet fields are used for filtering and grouping results:

```typescript
collections: {
  posts: {
    facetFields: ['category', 'status', 'author', 'tags']
  }
}
```

## Performance Optimization

### Batch Size

Adjust batch size for bulk operations:

```typescript
settings: {
  batchSize: 50 // Smaller batches for memory-constrained environments
}
```

### Auto Sync

Disable auto-sync for better performance during bulk imports:

```typescript
settings: {
  autoSync: false // Manually sync when needed
}
```

### Connection Settings

Optimize connection settings for your environment:

```typescript
typesense: {
  connectionTimeoutSeconds: 30, // Longer timeout for slow networks
  numRetries: 5,                // More retries for unreliable connections
  retryIntervalSeconds: 2       // Longer retry intervals
}
```

## Validation

The plugin validates your configuration at startup. Common validation errors:

### Missing Required Fields

```typescript
// ❌ Error: API key is required
typesense: {
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }]
}

// ✅ Correct
typesense: {
  apiKey: 'your-api-key',
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }]
}
```

### Invalid Collection Configuration

```typescript
// ❌ Error: At least one search field is required
collections: {
  posts: {
    enabled: true,
    searchFields: [] // Empty array
  }
}

// ✅ Correct
collections: {
  posts: {
    enabled: true,
    searchFields: ['title', 'content']
  }
}
```

## Development vs Production

### Development Configuration

```typescript
const isDevelopment = process.env.NODE_ENV === 'development'

const config = {
  plugins: [
    typesenseSearch({
      disabled: !isDevelopment, // Disable in development if needed
      typesense: {
        apiKey: 'dev-api-key',
        nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
      },
      settings: {
        autoSync: isDevelopment, // Disable auto-sync in production
        batchSize: isDevelopment ? 10 : 100,
      },
    }),
  ],
}
```

### Production Configuration

```typescript
const config = {
  plugins: [
    typesenseSearch({
      typesense: {
        apiKey: process.env.TYPESENSE_API_KEY!,
        nodes: [
          {
            host: process.env.TYPESENSE_HOST!,
            port: parseInt(process.env.TYPESENSE_PORT!),
            protocol: 'https',
          },
        ],
        connectionTimeoutSeconds: 30,
        numRetries: 5,
        retryIntervalSeconds: 2,
      },
      collections: {
        // ... production collection configs
      },
      settings: {
        autoSync: true,
        batchSize: 100,
        categorized: true,
      },
    }),
  ],
}
```

## Troubleshooting

### Configuration Validation Errors

Check the console for validation errors:

```
Invalid plugin configuration:
1. typesense.apiKey: API key is required
2. collections.posts.searchFields: At least one search field is required
```

### Typesense Connection Errors

Ensure your Typesense server is running and accessible:

```bash
curl http://localhost:8108/health
```

### Collection Sync Issues

Check if collections are properly configured and enabled:

```typescript
// Verify collection is enabled
collections: {
  posts: {
    enabled: true, // Must be true
    searchFields: ['title', 'content'] // Must have search fields
  }
}
```
