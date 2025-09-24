import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import type { TypesenseSearchConfig } from '../index'

import { createSearchEndpoints } from '../endpoints/search'

// Mock Typesense client
const mockTypesenseClient = {
  collections: vi.fn(() => ({
    documents: vi.fn(() => ({
      search: vi.fn(),
    })),
  })),
}

// Mock the typesense client creation
vi.mock('../lib/typesense-client', () => ({
  createTypesenseClient: vi.fn(() => mockTypesenseClient),
}))

describe('Search Endpoints', () => {
  let pluginOptions: TypesenseSearchConfig
  let searchEndpoints: any[]

  beforeEach(() => {
    pluginOptions = {
      collections: {
        disabled: {
          displayName: 'Disabled Collection',
          enabled: false,
          facetFields: [],
          icon: '❌',
          searchFields: ['title'],
        },
        portfolio: {
          displayName: 'Portfolio',
          enabled: true,
          facetFields: ['status', 'featured'],
          icon: '💼',
          searchFields: ['title', 'description'],
        },
        posts: {
          displayName: 'Blog Posts',
          enabled: true,
          facetFields: ['category', 'status'],
          icon: '📝',
          searchFields: ['title', 'content'],
        },
      },
      settings: {
        categorized: true,
      },
      typesense: {
        apiKey: 'test-key',
        nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
      },
    }

    searchEndpoints = createSearchEndpoints(mockTypesenseClient as Record<string, unknown>, pluginOptions)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Collections Endpoint', () => {
    test('should return enabled collections with metadata', async () => {
      const collectionsEndpoint = searchEndpoints.find((ep) => ep.path === '/search/collections')
      expect(collectionsEndpoint).toBeDefined()

      const mockRequest = {} as Record<string, unknown>
      const response = await collectionsEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('collections')
      expect(data).toHaveProperty('categorized', true)
      expect(data.collections).toHaveLength(2) // Only enabled collections

      const postsCollection = data.collections.find((c: Record<string, unknown>) => c.slug === 'posts')
      expect(postsCollection).toEqual({
        slug: 'posts',
        displayName: 'Blog Posts',
        facetFields: ['category', 'status'],
        icon: '📝',
        searchFields: ['title', 'content'],
      })
    })
  })

  describe('Universal Search Endpoint', () => {
    test('should perform search across all collections', async () => {
      const mockSearchResults = {
        found: 1,
        hits: [
          {
            document: { id: '1', _collection: 'posts', title: 'Test Post' },
            highlight: { title: { snippet: 'Test <mark>Post</mark>' } },
            text_match: 100,
          },
        ],
        page: 1,
        search_time_ms: 5,
      }

      mockTypesenseClient.collections().documents().search.mockResolvedValue(mockSearchResults)

      const universalSearchEndpoint = searchEndpoints.find((ep) => ep.path === '/search')
      expect(universalSearchEndpoint).toBeDefined()

      const mockRequest = {
        params: {},
        query: { per_page: '10', q: 'test' },
        url: 'http://localhost:3000/api/search?q=test&per_page=10',
      }
      const response = await universalSearchEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('hits')
      expect(data).toHaveProperty('found', 1)
      expect(data).toHaveProperty('page', 1)
      expect(data).toHaveProperty('search_time_ms', 5)
    })

    test('should return error for missing query parameter', async () => {
      const universalSearchEndpoint = searchEndpoints.find((ep) => ep.path === '/search')
      const mockRequest = {
        params: {},
        query: { per_page: '10' },
        url: 'http://localhost:3000/api/search?per_page=10',
      }
      const response = await universalSearchEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Query parameter "q" is required')
    })
  })

  describe('Collection-Specific Search Endpoint', () => {
    test('should perform search on specific collection', async () => {
      const mockSearchResults = {
        found: 1,
        hits: [
          {
            document: { id: '1', _collection: 'posts', title: 'Test Post' },
            highlight: { title: { snippet: 'Test <mark>Post</mark>' } },
            text_match: 100,
          },
        ],
        page: 1,
        search_time_ms: 3,
      }

      mockTypesenseClient.collections().documents().search.mockResolvedValue(mockSearchResults)

      const collectionSearchEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName',
      )
      expect(collectionSearchEndpoint).toBeDefined()

      const mockRequest = {
        params: { collectionName: 'posts' },
        query: { per_page: '10', q: 'test' },
        url: 'http://localhost:3000/api/search/posts?q=test&per_page=10',
      }
      const response = await collectionSearchEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('hits')
      expect(data).toHaveProperty('found', 1)
    })

    test('should return error for disabled collection', async () => {
      const collectionSearchEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName',
      )
      const mockRequest = {
        params: { collectionName: 'disabled' },
        query: { q: 'test' },
        url: 'http://localhost:3000/api/search/disabled?q=test',
      }
      const response = await collectionSearchEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Collection not enabled for search')
    })

    test('should return error for non-existent collection', async () => {
      const collectionSearchEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName',
      )
      const mockRequest = {
        params: { collectionName: 'nonexistent' },
        query: { q: 'test' },
        url: 'http://localhost:3000/api/search/nonexistent?q=test',
      }
      const response = await collectionSearchEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Collection not enabled for search')
    })
  })

  describe('Suggest Endpoint', () => {
    test('should return search suggestions', async () => {
      const mockSuggestResults = {
        found: 1,
        hits: [
          {
            document: { id: '1', _collection: 'posts', title: 'Test Post' },
            highlight: { title: { snippet: 'Test <mark>Post</mark>' } },
            text_match: 100,
          },
        ],
        page: 1,
        search_time_ms: 2,
      }

      mockTypesenseClient.collections().documents().search.mockResolvedValue(mockSuggestResults)

      const suggestEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName/suggest',
      )
      expect(suggestEndpoint).toBeDefined()

      const mockRequest = {
        params: { collectionName: 'posts' },
        query: { limit: '5', q: 'test' },
        url: 'http://localhost:3000/api/search/posts/suggest?q=test&limit=5',
      }
      const response = await suggestEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('hits')
      expect(data).toHaveProperty('found', 1)
    })

    test('should return error for disabled collection in suggest', async () => {
      const suggestEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName/suggest',
      )
      const mockRequest = {
        params: { collectionName: 'disabled' },
        query: { q: 'test' },
        url: 'http://localhost:3000/api/search/disabled/suggest?q=test',
      }
      const response = await suggestEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Collection not enabled for search')
    })

    test('should return error for missing query parameter in suggest', async () => {
      const suggestEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName/suggest',
      )
      const mockRequest = {
        params: { collectionName: 'posts' },
        query: { limit: '5' },
        url: 'http://localhost:3000/api/search/posts/suggest?limit=5',
      }
      const response = await suggestEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Query parameter "q" is required')
    })
  })

  describe('Advanced Search Endpoint', () => {
    test('should handle POST request with advanced search parameters', async () => {
      const mockSearchResults = {
        found: 1,
        hits: [
          {
            document: { id: '1', _collection: 'posts', title: 'Test Post' },
            highlight: { title: { snippet: 'Test <mark>Post</mark>' } },
            text_match: 100,
          },
        ],
        page: 1,
        search_time_ms: 4,
      }

      mockTypesenseClient.collections().documents().search.mockResolvedValue(mockSearchResults)

      const advancedSearchEndpoint = searchEndpoints.find(
        (ep) => ep.method === 'post' && ep.path === '/search/:collectionName',
      )
      expect(advancedSearchEndpoint).toBeDefined()

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          filters: { status: 'published' },
          page: 1,
          per_page: 10,
          q: 'test',
          sort_by: 'createdAt:desc',
        }),
        method: 'POST',
        params: { collectionName: 'posts' },
        query: {},
        url: 'http://localhost:3000/api/search/posts',
      }
      const response = await advancedSearchEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('hits')
      expect(data).toHaveProperty('found', 1)
    })

    test('should return error for disabled collection in advanced search', async () => {
      const advancedSearchEndpoint = searchEndpoints.find(
        (ep) => ep.method === 'post' && ep.path === '/search/:collectionName',
      )
      const mockRequest = {
        json: vi.fn().mockResolvedValue({ q: 'test' }),
        method: 'POST',
        params: { collectionName: 'disabled' },
        query: {},
        url: 'http://localhost:3000/api/search/disabled',
      }
      const response = await advancedSearchEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Collection not enabled for search')
    })
  })

  describe('Error Handling', () => {
    test('should handle Typesense search errors', async () => {
      mockTypesenseClient
        .collections()
        .documents()
        .search.mockRejectedValue(new Error('Typesense error'))

      const universalSearchEndpoint = searchEndpoints.find((ep) => ep.path === '/search')
      const mockRequest = {
        params: {},
        query: { q: 'test' },
        url: 'http://localhost:3000/api/search?q=test',
      }
      const response = await universalSearchEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Search failed')
    })

    test('should handle invalid JSON in advanced search', async () => {
      const advancedSearchEndpoint = searchEndpoints.find(
        (ep) => ep.method === 'post' && ep.path === '/search/:collectionName',
      )
      const mockRequest = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        method: 'POST',
        params: { collectionName: 'posts' },
        query: {},
        url: 'http://localhost:3000/api/search/posts',
      }
      const response = await advancedSearchEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Advanced search failed')
    })
  })

  describe('Route Registration', () => {
    test('should register all expected endpoints', () => {
      const expectedPaths = [
        '/search/collections',
        '/search/:collectionName/suggest',
        '/search/:collectionName',
        '/search',
      ]

      const registeredPaths = searchEndpoints.map((ep) => ep.path)
      expectedPaths.forEach((path) => {
        expect(registeredPaths).toContain(path)
      })
    })

    test('should have correct HTTP methods for each endpoint', () => {
      const collectionsEndpoint = searchEndpoints.find((ep) => ep.path === '/search/collections')
      expect(collectionsEndpoint?.method).toBe('get')

      const suggestEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName/suggest',
      )
      expect(suggestEndpoint?.method).toBe('get')

      const collectionSearchEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName' && ep.method === 'get',
      )
      expect(collectionSearchEndpoint?.method).toBe('get')

      const advancedSearchEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName' && ep.method === 'post',
      )
      expect(advancedSearchEndpoint?.method).toBe('post')

      const universalSearchEndpoint = searchEndpoints.find((ep) => ep.path === '/search')
      expect(universalSearchEndpoint?.method).toBe('get')
    })
  })
})
