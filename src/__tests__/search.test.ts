import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import type { TypesenseSearchConfig } from '../index'
import { createSearchEndpoints } from '../endpoints/search'
import { createTypesenseClient } from '../lib/typesense-client'

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
      typesense: {
        apiKey: 'test-key',
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
        portfolio: {
          enabled: true,
          searchFields: ['title', 'description'],
          facetFields: ['status', 'featured'],
          displayName: 'Portfolio',
          icon: '💼',
        },
        disabled: {
          enabled: false,
          searchFields: ['title'],
          facetFields: [],
          displayName: 'Disabled Collection',
          icon: '❌',
        },
      },
      settings: {
        categorized: true,
      },
    }

    searchEndpoints = createSearchEndpoints(mockTypesenseClient as any, pluginOptions)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Collections Endpoint', () => {
    test('should return enabled collections with metadata', async () => {
      const collectionsEndpoint = searchEndpoints.find((ep) => ep.path === '/search/collections')
      expect(collectionsEndpoint).toBeDefined()

      const mockRequest = {}
      const response = await collectionsEndpoint.handler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('collections')
      expect(data).toHaveProperty('categorized', true)
      expect(data.collections).toHaveLength(2) // Only enabled collections

      const postsCollection = data.collections.find((c: any) => c.slug === 'posts')
      expect(postsCollection).toEqual({
        slug: 'posts',
        displayName: 'Blog Posts',
        icon: '📝',
        searchFields: ['title', 'content'],
        facetFields: ['category', 'status'],
      })
    })
  })

  describe('Universal Search Endpoint', () => {
    test('should perform search across all collections', async () => {
      const mockSearchResults = {
        hits: [
          {
            document: { id: '1', title: 'Test Post', _collection: 'posts' },
            highlight: { title: { snippet: 'Test <mark>Post</mark>' } },
            text_match: 100,
          },
        ],
        found: 1,
        page: 1,
        search_time_ms: 5,
      }

      mockTypesenseClient.collections().documents().search.mockResolvedValue(mockSearchResults)

      const universalSearchEndpoint = searchEndpoints.find((ep) => ep.path === '/search')
      expect(universalSearchEndpoint).toBeDefined()

      const mockRequest = {
        url: 'http://localhost:3000/api/search?q=test&per_page=10',
        params: {},
        query: { q: 'test', per_page: '10' },
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
        url: 'http://localhost:3000/api/search?per_page=10',
        params: {},
        query: { per_page: '10' },
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
        hits: [
          {
            document: { id: '1', title: 'Test Post', _collection: 'posts' },
            highlight: { title: { snippet: 'Test <mark>Post</mark>' } },
            text_match: 100,
          },
        ],
        found: 1,
        page: 1,
        search_time_ms: 3,
      }

      mockTypesenseClient.collections().documents().search.mockResolvedValue(mockSearchResults)

      const collectionSearchEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName',
      )
      expect(collectionSearchEndpoint).toBeDefined()

      const mockRequest = {
        url: 'http://localhost:3000/api/search/posts?q=test&per_page=10',
        params: { collectionName: 'posts' },
        query: { q: 'test', per_page: '10' },
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
        url: 'http://localhost:3000/api/search/disabled?q=test',
        params: { collectionName: 'disabled' },
        query: { q: 'test' },
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
        url: 'http://localhost:3000/api/search/nonexistent?q=test',
        params: { collectionName: 'nonexistent' },
        query: { q: 'test' },
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
        hits: [
          {
            document: { id: '1', title: 'Test Post', _collection: 'posts' },
            highlight: { title: { snippet: 'Test <mark>Post</mark>' } },
            text_match: 100,
          },
        ],
        found: 1,
        page: 1,
        search_time_ms: 2,
      }

      mockTypesenseClient.collections().documents().search.mockResolvedValue(mockSuggestResults)

      const suggestEndpoint = searchEndpoints.find(
        (ep) => ep.path === '/search/:collectionName/suggest',
      )
      expect(suggestEndpoint).toBeDefined()

      const mockRequest = {
        url: 'http://localhost:3000/api/search/posts/suggest?q=test&limit=5',
        params: { collectionName: 'posts' },
        query: { q: 'test', limit: '5' },
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
        url: 'http://localhost:3000/api/search/disabled/suggest?q=test',
        params: { collectionName: 'disabled' },
        query: { q: 'test' },
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
        url: 'http://localhost:3000/api/search/posts/suggest?limit=5',
        params: { collectionName: 'posts' },
        query: { limit: '5' },
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
        hits: [
          {
            document: { id: '1', title: 'Test Post', _collection: 'posts' },
            highlight: { title: { snippet: 'Test <mark>Post</mark>' } },
            text_match: 100,
          },
        ],
        found: 1,
        page: 1,
        search_time_ms: 4,
      }

      mockTypesenseClient.collections().documents().search.mockResolvedValue(mockSearchResults)

      const advancedSearchEndpoint = searchEndpoints.find(
        (ep) => ep.method === 'post' && ep.path === '/search/:collectionName',
      )
      expect(advancedSearchEndpoint).toBeDefined()

      const mockRequest = {
        url: 'http://localhost:3000/api/search/posts',
        method: 'POST',
        params: { collectionName: 'posts' },
        query: {},
        json: vi.fn().mockResolvedValue({
          q: 'test',
          page: 1,
          per_page: 10,
          sort_by: 'createdAt:desc',
          filters: { status: 'published' },
        }),
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
        url: 'http://localhost:3000/api/search/disabled',
        method: 'POST',
        params: { collectionName: 'disabled' },
        query: {},
        json: vi.fn().mockResolvedValue({ q: 'test' }),
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
        url: 'http://localhost:3000/api/search?q=test',
        params: {},
        query: { q: 'test' },
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
        url: 'http://localhost:3000/api/search/posts',
        method: 'POST',
        params: { collectionName: 'posts' },
        query: {},
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
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
