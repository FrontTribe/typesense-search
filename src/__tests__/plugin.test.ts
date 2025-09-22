import { describe, expect, test, beforeEach, vi } from 'vitest'
import type { Config } from 'payload'
import { typesenseSearch } from '../index'
import { createTypesenseClient } from '../lib/typesense-client'
import { initializeTypesenseCollections } from '../lib/initialization'
import { mapPayloadDocumentToTypesense } from '../lib/schema-mapper'

// Mock dependencies
vi.mock('../lib/typesense-client')
vi.mock('../lib/initialization')
vi.mock('../lib/schema-mapper')

describe('Typesense Search Plugin', () => {
  let mockConfig: Config
  let mockTypesenseClient: any
  let pluginOptions: any

  beforeEach(() => {
    mockTypesenseClient = {
      collections: vi.fn(() => ({
        create: vi.fn(),
        documents: vi.fn(() => ({
          create: vi.fn(),
          upsert: vi.fn(),
          delete: vi.fn(),
        })),
      })),
    }
    ;(createTypesenseClient as any).mockReturnValue(mockTypesenseClient)
    ;(initializeTypesenseCollections as any).mockResolvedValue(undefined)
    ;(mapPayloadDocumentToTypesense as any).mockReturnValue({ id: 'test', title: 'Test' })

    mockConfig = {
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
      admin: {
        components: {
          beforeDashboard: [],
        },
      },
    } as any

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
        media: {
          enabled: true,
          searchFields: ['filename', 'alt'],
          facetFields: ['type'],
          displayName: 'Media Files',
          icon: '🖼️',
        },
      },
      settings: {
        autoSync: true,
        categorized: true,
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
        posts: {
          enabled: false,
          searchFields: ['title'],
          facetFields: [],
        },
        media: {
          enabled: true,
          searchFields: ['filename'],
          facetFields: [],
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
      await result.onInit({ payload: {} as any })
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
          method: 'get' as const,
          path: '/custom',
          handler: vi.fn(),
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

    const mockDoc = { id: '1', title: 'Test Post', content: 'Test content' }
    const mockReq = { payload: {} as any }

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

    const mockDoc = { id: '1', title: 'Updated Post', content: 'Updated content' }
    const mockReq = { payload: {} as any }

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
    const mockReq = { payload: {} as any }

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
    const mockReq = { payload: {} as any }

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
