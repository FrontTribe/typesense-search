import type { Config } from 'payload'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { typesenseSearch } from '../index'
import { initializeTypesenseCollections } from '../lib/initialization'
import { mapPayloadDocumentToTypesense } from '../lib/schema-mapper'
import { createTypesenseClient } from '../lib/typesense-client'

// Mock dependencies
vi.mock('../lib/typesense-client')
vi.mock('../lib/initialization')
vi.mock('../lib/schema-mapper')

describe('Typesense Search Plugin', () => {
  let mockConfig: Config
  let mockTypesenseClient: Record<string, unknown>
  let pluginOptions: Record<string, unknown>

  beforeEach(() => {
    mockTypesenseClient = {
      collections: vi.fn(() => ({
        create: vi.fn(),
        documents: vi.fn(() => ({
          create: vi.fn(),
          delete: vi.fn(),
          upsert: vi.fn(),
        })),
      })),
    }
    ;(createTypesenseClient as unknown as jest.Mock).mockReturnValue(mockTypesenseClient)
    ;(initializeTypesenseCollections as unknown as jest.Mock).mockResolvedValue(undefined)
    ;(mapPayloadDocumentToTypesense as unknown as jest.Mock).mockReturnValue({ id: 'test', title: 'Test' })

    mockConfig = {
      admin: {
        components: {
          beforeDashboard: [],
        },
      },
      collections: [
        {
          slug: 'posts',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'content', type: 'richText' },
          ],
          hooks: {},
        },
        {
          slug: 'media',
          fields: [
            { name: 'filename', type: 'text' },
            { name: 'alt', type: 'text' },
          ],
          hooks: {},
        },
      ],
      endpoints: [],
    } as Record<string, unknown>

    pluginOptions = {
      collections: {
        media: {
          displayName: 'Media Files',
          enabled: true,
          facetFields: ['type'],
          icon: '🖼️',
          searchFields: ['filename', 'alt'],
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
        autoSync: true,
        categorized: true,
      },
      typesense: {
        apiKey: 'test-key',
        nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
      },
    }
  })

  test('should initialize plugin with correct configuration', () => {
    const plugin = typesenseSearch(pluginOptions)
    const result = plugin(mockConfig)

    expect(createTypesenseClient).toHaveBeenCalledWith(pluginOptions.typesense)
    expect(result).toBe(mockConfig)
  })

  test('should register search endpoints', () => {
    const plugin = typesenseSearch(pluginOptions)
    const result = plugin(mockConfig)

    expect(result.endpoints).toHaveLength(5) // collections, suggest, collection search, advanced search, universal search
    expect(result.endpoints?.some((ep) => ep.path === '/search/collections')).toBe(true)
    expect(result.endpoints?.some((ep) => ep.path === '/search')).toBe(true)
    expect(result.endpoints?.some((ep) => ep.path === '/search/:collectionName')).toBe(true)
    expect(result.endpoints?.some((ep) => ep.path === '/search/:collectionName/suggest')).toBe(true)
  })

  test('should add hooks to enabled collections', () => {
    const plugin = typesenseSearch(pluginOptions)
    const result = plugin(mockConfig)

    const postsCollection = result.collections?.find((c) => c.slug === 'posts')
    expect(postsCollection?.hooks?.afterChange).toHaveLength(1)
    expect(postsCollection?.hooks?.afterDelete).toHaveLength(1)

    const mediaCollection = result.collections?.find((c) => c.slug === 'media')
    expect(mediaCollection?.hooks?.afterChange).toHaveLength(1)
    expect(mediaCollection?.hooks?.afterDelete).toHaveLength(1)
  })

  test('should not add hooks to disabled collections', () => {
    const pluginOptionsWithDisabled = {
      ...pluginOptions,
      collections: {
        media: {
          enabled: true,
          facetFields: [],
          searchFields: ['filename'],
        },
        posts: {
          enabled: false,
          facetFields: [],
          searchFields: ['title'],
        },
      },
    }

    const plugin = typesenseSearch(pluginOptionsWithDisabled)
    const result = plugin(mockConfig)

    const postsCollection = result.collections?.find((c) => c.slug === 'posts')
    expect(postsCollection?.hooks?.afterChange).toHaveLength(0)
    expect(postsCollection?.hooks?.afterDelete).toHaveLength(0)

    const mediaCollection = result.collections?.find((c) => c.slug === 'media')
    expect(mediaCollection?.hooks?.afterChange).toHaveLength(1)
    expect(mediaCollection?.hooks?.afterDelete).toHaveLength(1)
  })

  test('should handle disabled plugin', () => {
    const disabledPluginOptions = {
      ...pluginOptions,
      disabled: true,
    }

    const plugin = typesenseSearch(disabledPluginOptions)
    const result = plugin(mockConfig)

    expect(result).toBe(mockConfig)
    expect(result.endpoints).toHaveLength(0)
    expect(result.collections?.every((c) => !c.hooks?.afterChange?.length)).toBe(true)
  })

  test('should handle autoSync disabled', () => {
    const pluginOptionsNoSync = {
      ...pluginOptions,
      settings: {
        autoSync: false,
        categorized: true,
      },
    }

    const plugin = typesenseSearch(pluginOptionsNoSync)
    const result = plugin(mockConfig)

    expect(result.collections?.every((c) => !c.hooks?.afterChange?.length)).toBe(true)
  })

  test('should initialize collections on init', async () => {
    const plugin = typesenseSearch(pluginOptions)
    const result = plugin(mockConfig)

    // Simulate onInit call
    if (result.onInit) {
      await result.onInit({ payload: {} as Record<string, unknown> })
    }

    expect(initializeTypesenseCollections).toHaveBeenCalledWith(
      mockTypesenseClient,
      pluginOptions.collections,
      mockConfig.collections,
    )
  })

  test('should handle missing collections configuration', () => {
    const pluginOptionsNoCollections = {
      ...pluginOptions,
      collections: undefined,
    }

    const plugin = typesenseSearch(pluginOptionsNoCollections)
    const result = plugin(mockConfig)

    expect(result.collections?.every((c) => !c.hooks?.afterChange?.length)).toBe(true)
  })

  test('should preserve existing hooks', () => {
    const configWithExistingHooks = {
      ...mockConfig,
      collections: [
        {
          ...mockConfig.collections![0],
          hooks: {
            afterChange: [vi.fn()],
            afterDelete: [vi.fn()],
          },
        },
      ],
    }

    const plugin = typesenseSearch(pluginOptions)
    const result = plugin(configWithExistingHooks)

    const postsCollection = result.collections?.find((c) => c.slug === 'posts')
    expect(postsCollection?.hooks?.afterChange).toHaveLength(2) // existing + new
    expect(postsCollection?.hooks?.afterDelete).toHaveLength(2) // existing + new
  })

  test('should preserve existing endpoints', () => {
    const configWithExistingEndpoints = {
      ...mockConfig,
      endpoints: [
        {
          handler: vi.fn(),
          method: 'get' as const,
          path: '/custom',
        },
      ],
    }

    const plugin = typesenseSearch(pluginOptions)
    const result = plugin(configWithExistingEndpoints)

    expect(result.endpoints).toHaveLength(6) // existing + 5 new
    expect(result.endpoints?.some((ep) => ep.path === '/custom')).toBe(true)
  })

  test('should handle afterChange hook for create operation', async () => {
    const plugin = typesenseSearch(pluginOptions)
    const result = plugin(mockConfig)

    const postsCollection = result.collections?.find((c) => c.slug === 'posts')
    const afterChangeHook = postsCollection?.hooks?.afterChange?.[0]

    expect(afterChangeHook).toBeDefined()

    const mockDoc = { id: '1', content: 'Test content', title: 'Test Post' }
    const mockReq = { payload: {} as Record<string, unknown> }

    await afterChangeHook!({
      doc: mockDoc,
      operation: 'create',
      req: mockReq,
    })

    expect(mapPayloadDocumentToTypesense).toHaveBeenCalledWith(
      mockDoc,
      pluginOptions.collections.posts,
      'posts',
    )
    expect(mockTypesenseClient.collections().documents().create).toHaveBeenCalled()
  })

  test('should handle afterChange hook for update operation', async () => {
    const plugin = typesenseSearch(pluginOptions)
    const result = plugin(mockConfig)

    const postsCollection = result.collections?.find((c) => c.slug === 'posts')
    const afterChangeHook = postsCollection?.hooks?.afterChange?.[0]

    const mockDoc = { id: '1', content: 'Updated content', title: 'Updated Post' }
    const mockReq = { payload: {} as Record<string, unknown> }

    await afterChangeHook!({
      doc: mockDoc,
      operation: 'update',
      req: mockReq,
    })

    expect(mapPayloadDocumentToTypesense).toHaveBeenCalledWith(
      mockDoc,
      pluginOptions.collections.posts,
      'posts',
    )
    expect(mockTypesenseClient.collections().documents().upsert).toHaveBeenCalled()
  })

  test('should handle afterDelete hook', async () => {
    const plugin = typesenseSearch(pluginOptions)
    const result = plugin(mockConfig)

    const postsCollection = result.collections?.find((c) => c.slug === 'posts')
    const afterDeleteHook = postsCollection?.hooks?.afterDelete?.[0]

    expect(afterDeleteHook).toBeDefined()

    const mockDoc = { id: '1', title: 'Test Post' }
    const mockReq = { payload: {} as Record<string, unknown> }

    await afterDeleteHook!({
      doc: mockDoc,
      req: mockReq,
    })

    expect(mockTypesenseClient.collections().documents().delete).toHaveBeenCalledWith('1')
  })

  test('should handle hook errors gracefully', async () => {
    const plugin = typesenseSearch(pluginOptions)
    const result = plugin(mockConfig)

    const postsCollection = result.collections?.find((c) => c.slug === 'posts')
    const afterChangeHook = postsCollection?.hooks?.afterChange?.[0]

    // Mock an error in the hook
    mockTypesenseClient
      .collections()
      .documents()
      .create.mockRejectedValue(new Error('Typesense error'))

    const mockDoc = { id: '1', title: 'Test Post' }
    const mockReq = { payload: {} as Record<string, unknown> }

    // Should not throw
    await expect(
      afterChangeHook!({
        doc: mockDoc,
        operation: 'create',
        req: mockReq,
      }),
    ).resolves.not.toThrow()
  })
})
