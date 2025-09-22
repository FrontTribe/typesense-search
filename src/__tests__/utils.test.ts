import { describe, expect, test, beforeEach, vi } from 'vitest'
import { mapPayloadDocumentToTypesense } from '../lib/schema-mapper'

describe('Schema Mapper', () => {
  test('should map basic text fields', () => {
    const doc = {
      id: '1',
      title: 'Test Post',
      content: 'This is test content',
      status: 'published',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      searchFields: ['title', 'content'],
      facetFields: ['status'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      title: 'Test Post',
      content: 'This is test content',
      status: 'published',
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should handle richText fields', () => {
    const doc = {
      id: '1',
      title: 'Test Post',
      content: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'This is rich text content',
                },
              ],
            },
          ],
        },
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      searchFields: ['title', 'content'],
      facetFields: [],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      title: 'Test Post',
      content: 'This is rich text content',
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should handle array fields with dot notation', () => {
    const doc = {
      id: '1',
      title: 'Test Post',
      tags: [{ tag: 'javascript' }, { tag: 'typescript' }],
      technologies: [
        { name: 'React', category: 'frontend' },
        { name: 'Node.js', category: 'backend' },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      searchFields: ['title', 'tags.tag', 'technologies.name'],
      facetFields: ['technologies.category'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      title: 'Test Post',
      'tags.tag': 'javascript typescript',
      'technologies.name': 'React Node.js',
      'technologies.category': 'unknown',
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should handle missing fields with defaults', () => {
    const doc = {
      id: '1',
      title: 'Test Post',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      searchFields: ['title', 'content', 'description'],
      facetFields: ['status'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      title: 'Test Post',
      content: '',
      description: '',
      status: 'unknown',
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should handle null and undefined values', () => {
    const doc = {
      id: '1',
      title: 'Test Post',
      content: null,
      description: undefined,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      searchFields: ['title', 'content'],
      facetFields: [],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      title: 'Test Post',
      content: '',
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should handle empty arrays', () => {
    const doc = {
      id: '1',
      title: 'Test Post',
      tags: [],
      categories: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      searchFields: ['title', 'tags.tag'],
      facetFields: ['categories'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      title: 'Test Post',
      'tags.tag': '',
      categories: '',
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should add placeholder when no searchable content', () => {
    const doc = {
      id: '1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      searchFields: ['title', 'content'],
      facetFields: [],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result.title).toBe('Document 1')
    expect(result.content).toBe('')
  })

  test('should handle missing createdAt and updatedAt', () => {
    const doc = {
      id: '1',
      title: 'Test Post',
    }

    const collectionConfig = {
      enabled: true,
      searchFields: ['title'],
      facetFields: [],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result.id).toBe('1')
    expect(result.title).toBe('Test Post')
    expect(result.createdAt).toBeTypeOf('number')
    expect(result.updatedAt).toBeTypeOf('number')
  })

  test('should throw error for missing id', () => {
    const doc = {
      title: 'Test Post',
    }

    const collectionConfig = {
      enabled: true,
      searchFields: ['title'],
      facetFields: [],
    }

    expect(() => {
      mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)
    }).toThrow("Document missing required 'id' field")
  })

  test('should handle missing collection config gracefully', () => {
    const doc = {
      id: '1',
      title: 'Test Post',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', undefined)

    expect(result).toEqual({
      id: '1',
      title: 'Test Post',
      content: '',
      description: '',
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should convert all values to strings for search fields', () => {
    const doc = {
      id: '1',
      title: 'Test Post',
      views: 100,
      published: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      searchFields: ['title', 'views', 'published'],
      facetFields: [],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result.title).toBe('Test Post')
    expect(result.views).toBe('100')
    expect(result.published).toBe('true')
  })
})
