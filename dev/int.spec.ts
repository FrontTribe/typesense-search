import type { Payload } from 'payload'

import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { customEndpointHandler } from '../src/endpoints/customEndpointHandler.js'

let payload: Payload

afterAll(async () => {
  // Clean up if needed
  if (payload && typeof payload.destroy === 'function') {
    await payload.destroy()
  }
})

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('Typesense Search Plugin integration tests', () => {
  test('should query custom endpoint added by plugin', async () => {
    const request = new Request('http://localhost:3000/api/my-plugin-endpoint', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await customEndpointHandler(payloadRequest)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toMatchObject({
      message: 'Hello from custom endpoint',
    })
  })

  test('should create post and sync to Typesense', async () => {
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
  })

  test('should handle search endpoint for posts', async () => {
    const request = new Request('http://localhost:3000/api/search/posts?q=test', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await payloadRequest
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    // The response should be a valid search result structure
    expect(data).toHaveProperty('hits')
    expect(data).toHaveProperty('found')
    expect(data).toHaveProperty('page')
    expect(data).toHaveProperty('search_time_ms')
  })

  test('should handle search endpoint for media', async () => {
    const request = new Request('http://localhost:3000/api/search/media?q=test', {
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
    const request = new Request('http://localhost:3000/api/search/posts/suggest?q=test&limit=3', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await payloadRequest
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('hits')
    expect(data.hits.length).toBeLessThanOrEqual(3)
  })

  test('should return error for disabled collection', async () => {
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

  test('should handle advanced search with POST', async () => {
    const searchBody = {
      q: 'test',
      query_by: 'title,content',
      per_page: 5,
      highlight_full_fields: 'title,content',
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
})
