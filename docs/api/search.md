# Search API

The Typesense Search Plugin provides several API endpoints for searching your content.

## Base URL

All API endpoints are prefixed with `/api/search`:

```
http://localhost:3000/api/search
```

## Universal Search

Search across all enabled collections simultaneously.

### GET /api/search

Search all collections with a single query.

**Parameters:**

| Parameter  | Type   | Description              | Default  |
| ---------- | ------ | ------------------------ | -------- |
| `q`        | string | Search query             | Required |
| `page`     | number | Page number (1-based)    | 1        |
| `per_page` | number | Results per page         | 10       |
| `sort_by`  | string | Sort field and direction | Optional |

**Example:**

```bash
curl "http://localhost:3000/api/search?q=typesense&per_page=5"
```

**Response:**

```json
{
  "collections": [
    {
      "collection": "posts",
      "displayName": "Posts",
      "found": 2,
      "icon": "📄"
    }
  ],
  "found": 2,
  "hits": [
    {
      "collection": "posts",
      "displayName": "Posts",
      "document": {
        "id": "1",
        "title": "Getting Started with Typesense",
        "content": "Typesense is a fast search engine...",
        "createdAt": "2025-01-01T00:00:00Z"
      },
      "highlight": {
        "title": "Getting Started with <mark>Typesense</mark>",
        "content": "<mark>Typesense</mark> is a fast search engine..."
      },
      "text_match": 0.95,
      "icon": "📄"
    }
  ],
  "page": 1,
  "request_params": {
    "per_page": 5,
    "q": "typesense"
  },
  "search_cutoff": false,
  "search_time_ms": 15
}
```

## Collection-Specific Search

Search within a specific collection.

### GET /api/search/{collection}

Search a specific collection.

**Parameters:**

Same as universal search, plus:

| Parameter    | Type   | Description                   |
| ------------ | ------ | ----------------------------- |
| `collection` | string | Collection name (in URL path) |

**Example:**

```bash
curl "http://localhost:3000/api/search/posts?q=typesense&per_page=5"
```

**Response:**

```json
{
  "found": 2,
  "hits": [
    {
      "document": {
        "id": "1",
        "title": "Getting Started with Typesense",
        "content": "Typesense is a fast search engine...",
        "createdAt": "2025-01-01T00:00:00Z"
      },
      "highlight": {
        "title": "Getting Started with <mark>Typesense</mark>",
        "content": "<mark>Typesense</mark> is a fast search engine..."
      },
      "text_match": 0.95
    }
  ],
  "page": 1,
  "request_params": {
    "per_page": 5,
    "q": "typesense"
  },
  "search_cutoff": false,
  "search_time_ms": 12
}
```

## Advanced Search

### POST /api/search/{collection}

Perform advanced search with custom Typesense parameters. This endpoint accepts raw Typesense search parameters.

**Request Body:**

Any valid Typesense search parameters as JSON object.

**Example:**

```bash
curl -X POST "http://localhost:3000/api/search/posts" \
  -H "Content-Type: application/json" \
  -d '{"q": "typesense", "query_by": "title,content", "filter_by": "category:tech"}'
```

**Response:**

Returns raw Typesense search results.

## Search Suggestions

Get autocomplete suggestions for search queries.

### GET /api/search/{collection}/suggest

**Parameters:**

| Parameter | Type   | Description     | Default  |
| --------- | ------ | --------------- | -------- |
| `q`       | string | Partial query   | Required |
| `limit`   | number | Max suggestions | 5        |

**Example:**

```bash
curl "http://localhost:3000/api/search/posts/suggest?q=typ&limit=3"
```

**Response:**

```json
{
  "found": 3,
  "hits": [
    {
      "document": {
        "id": "1",
        "title": "Typesense Tutorial"
      },
      "highlight": {
        "title": "<mark>Typesense</mark> Tutorial"
      },
      "text_match": 0.9
    }
  ],
  "page": 1,
  "request_params": {
    "per_page": 3,
    "q": "typ"
  },
  "search_cutoff": false,
  "search_time_ms": 8
}
```

## Collections Metadata

Get information about available collections.

### GET /api/search/collections

**Response:**

```json
{
  "categorized": false,
  "collections": [
    {
      "slug": "posts",
      "displayName": "Posts",
      "icon": "📄",
      "facetFields": [],
      "searchFields": []
    },
    {
      "slug": "pages",
      "displayName": "Pages",
      "icon": "📄",
      "facetFields": [],
      "searchFields": []
    }
  ]
}
```

## Health Check

Check if the search service is healthy.

### GET /api/search/health

**Response:**

```json
{
  "status": "healthy",
  "typesense": {
    "ok": true,
    "version": "unknown"
  },
  "collections": ["posts", "pages"],
  "cache": {
    "maxSize": 1000,
    "size": 5,
    "hitRate": 0.85
  },
  "lastSync": 1704067200000,
  "responseTime": 15,
  "timestamp": "2025-01-01T00:00:00Z",
  "version": "1.0.6"
}
```

## Detailed Health Check

Get detailed information about the search service.

### GET /api/search/health/detailed

**Response:**

```json
{
  "status": "healthy",
  "typesense": {
    "ok": true,
    "version": "unknown"
  },
  "collections": ["posts", "pages"],
  "collectionDetails": [
    {
      "name": "posts",
      "createdAt": "2025-01-01T00:00:00Z",
      "fields": 5,
      "numDocuments": 150
    }
  ],
  "config": {
    "enabledCollections": [
      {
        "name": "posts",
        "displayName": "Posts",
        "facetFields": [],
        "searchFields": []
      }
    ],
    "settings": {
      "categorized": false
    },
    "totalCollections": 1
  },
  "cache": {
    "maxSize": 1000,
    "size": 5,
    "hitRate": 0.85
  },
  "lastSync": 1704067200000,
  "responseTime": 25,
  "timestamp": "2025-01-01T00:00:00Z",
  "version": "1.0.6"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request

```json
{
  "error": "Query parameter \"q\" is required",
  "details": "Please provide a search query using ?q=your_search_term",
  "example": "/api/search?q=example"
}
```

### 500 Internal Server Error

```json
{
  "error": "Search handler failed",
  "details": "Typesense connection error"
}
```

## Caching

The API includes built-in caching:

- **Cache Key**: Based on query, collection, and parameters
- **TTL**: 5 minutes (300,000ms) by default
- **Max Size**: 1000 entries by default
- **Hit Rate**: Available in health check responses
