import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import type { Payload } from 'payload'
import { createPayloadRequest, getPayload } from 'payload'

// Mock config for testing
const config = {
  secret: 'test-secret-key',
  collections: [
    {
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'content', type: 'richText' },
      ],
    },
    {
      slug: 'media',
      fields: [
        { name: 'filename', type: 'text' },
        { name: 'alt', type: 'text' },
      ],
    },
  ],
  endpoints: [],
  plugins: [],
} as any

// Mock Typesense client
const mockTypesenseClient = {
  collections: vi.fn(() => ({
    create: vi.fn(),
    documents: vi.fn(() => ({
      create: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    })),
  })),
}

// Mock the typesense client creation
vi.mock('../lib/typesense-client', () => ({
  createTypesenseClient: vi.fn(() => mockTypesenseClient),
}))

// Mock the initialization
vi.mock('../lib/initialization', () => ({
  initializeTypesenseCollections: vi.fn().mockResolvedValue(undefined),
}))

// Mock the schema mapper
vi.mock('../lib/schema-mapper', () => ({
  mapPayloadDocumentToTypesense: vi.fn((doc) => ({
    ...doc,
    _collection: 'posts',
  })),
}))

describe('Typesense Search Plugin Integration Tests', () => {
  let payload: Payload

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    if (payload && typeof payload.destroy === 'function') {
      await payload.destroy()
    }
  })

  test('should initialize plugin with Payload CMS', async () => {
    payload = await getPayload({ config })

    // Check that the plugin has been loaded
    expect(payload.config.plugins).toBeDefined()

    // Check that search endpoints are registered
    const searchEndpoints = payload.config.endpoints?.filter((ep) => ep.path?.includes('/search'))
    expect(searchEndpoints).toHaveLength(5)
  })

  test('should handle collections endpoint', async () => {
    payload = await getPayload({ config })

    const request = new Request('http://localhost:3000/api/search/collections', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await payloadRequest

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('collections')
    expect(data).toHaveProperty('categorized')
    expect(Array.isArray(data.collections)).toBe(true)
  })

  test('should handle universal search endpoint', async () => {
    // Mock search results
    mockTypesenseClient
      .collections()
      .documents()
      .search.mockResolvedValue({
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
      })

    payload = await getPayload({ config })

    const request = new Request('http://localhost:3000/api/search?q=test&per_page=10', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await payloadRequest

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('hits')
    expect(data).toHaveProperty('found')
    expect(data).toHaveProperty('page')
    expect(data).toHaveProperty('search_time_ms')
  })

  test('should handle collection-specific search endpoint', async () => {
    // Mock search results
    mockTypesenseClient
      .collections()
      .documents()
      .search.mockResolvedValue({
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
      })

    payload = await getPayload({ config })

    const request = new Request('http://localhost:3000/api/search/posts?q=test&per_page=10', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await payloadRequest

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('hits')
    expect(data).toHaveProperty('found')
  })

  test('should handle suggest endpoint', async () => {
    // Mock suggest results
    mockTypesenseClient
      .collections()
      .documents()
      .search.mockResolvedValue({
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
      })

    payload = await getPayload({ config })

    const request = new Request('http://localhost:3000/api/search/posts/suggest?q=test&limit=5', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await payloadRequest

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('hits')
    expect(data).toHaveProperty('found')
  })

  test('should handle advanced search with POST', async () => {
    // Mock search results
    mockTypesenseClient
      .collections()
      .documents()
      .search.mockResolvedValue({
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
      })

    payload = await getPayload({ config })

    const searchBody = {
      q: 'test',
      page: 1,
      per_page: 10,
      sort_by: 'createdAt:desc',
      filters: { status: 'published' },
    }

    const request = new Request('http://localhost:3000/api/search/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchBody),
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await payloadRequest

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('hits')
    expect(data).toHaveProperty('found')
  })

  test('should return error for disabled collection', async () => {
    payload = await getPayload({ config })

    const request = new Request('http://localhost:3000/api/search/nonexistent?q=test', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await payloadRequest

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toBe('Collection not enabled for search')
  })

  test('should return error for missing query parameter', async () => {
    payload = await getPayload({ config })

    const request = new Request('http://localhost:3000/api/search/posts', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await payloadRequest

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toBe('Query parameter "q" is required')
  })

  test('should handle Typesense search errors', async () => {
    // Mock Typesense error
    mockTypesenseClient
      .collections()
      .documents()
      .search.mockRejectedValue(new Error('Typesense connection failed'))

    payload = await getPayload({ config })

    const request = new Request('http://localhost:3000/api/search?q=test', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await payloadRequest

    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toBe('Search failed')
  })

  test('should handle document creation and sync', async () => {
    payload = await getPayload({ config })

    // Mock successful Typesense operations
    mockTypesenseClient.collections().documents().create.mockResolvedValue({})
    mockTypesenseClient.collections().documents().upsert.mockResolvedValue({})
    mockTypesenseClient.collections().documents().delete.mockResolvedValue({})

    // Create a post
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Test Post for Typesense',
        content: 'This is test content for search functionality',
      },
    })

    expect(post.title).toBe('Test Post for Typesense')
    expect(post.content).toBe('This is test content for search functionality')

    // Wait a moment for sync to complete
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // The hooks should have been called
    // Note: In a real test, you would verify that the Typesense operations were called
  })

  test('should handle document update and sync', async () => {
    payload = await getPayload({ config })

    // Mock successful Typesense operations
    mockTypesenseClient.collections().documents().upsert.mockResolvedValue({})

    // Create a post first
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Original Title',
        content: 'Original content',
      },
    })

    // Update the post
    const updatedPost = await payload.update({
      collection: 'posts',
      id: post.id,
      data: {
        title: 'Updated Title',
        content: 'Updated content',
      },
    })

    expect(updatedPost.title).toBe('Updated Title')
    expect(updatedPost.content).toBe('Updated content')

    // Wait a moment for sync to complete
    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  test('should handle document deletion and sync', async () => {
    payload = await getPayload({ config })

    // Mock successful Typesense operations
    mockTypesenseClient.collections().documents().create.mockResolvedValue({})
    mockTypesenseClient.collections().documents().delete.mockResolvedValue({})

    // Create a post first
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Post to Delete',
        content: 'This post will be deleted',
      },
    })

    // Delete the post
    await payload.delete({
      collection: 'posts',
      id: post.id,
    })

    // Wait a moment for sync to complete
    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  test('should handle multiple collections', async () => {
    payload = await getPayload({ config })

    // Mock search results for different collections
    mockTypesenseClient
      .collections()
      .documents()
      .search.mockImplementation((params) => {
        if (params.collection_name === 'posts') {
          return Promise.resolve({
            hits: [{ document: { id: '1', title: 'Post', _collection: 'posts' } }],
            found: 1,
            page: 1,
            search_time_ms: 2,
          })
        }
        if (params.collection_name === 'media') {
          return Promise.resolve({
            hits: [{ document: { id: '2', filename: 'image.jpg', _collection: 'media' } }],
            found: 1,
            page: 1,
            search_time_ms: 1,
          })
        }
        return Promise.resolve({ hits: [], found: 0, page: 1, search_time_ms: 0 })
      })

    // Test posts collection
    const postsRequest = new Request('http://localhost:3000/api/search/posts?q=test', {
      method: 'GET',
    })
    const postsPayloadRequest = await createPayloadRequest({ config, request: postsRequest })
    const postsResponse = await postsPayloadRequest
    expect(postsResponse.status).toBe(200)

    // Test media collection
    const mediaRequest = new Request('http://localhost:3000/api/search/media?q=test', {
      method: 'GET',
    })
    const mediaPayloadRequest = await createPayloadRequest({ config, request: mediaRequest })
    const mediaResponse = await mediaPayloadRequest
    expect(mediaResponse.status).toBe(200)
  })
})
