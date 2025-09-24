import { describe, expect, test } from 'vitest'

import { mapPayloadDocumentToTypesense } from '../lib/schema-mapper'

describe('Schema Mapper', () => {
  test('should map basic text fields', () => {
    const doc = {
      id: '1',
      content: 'This is test content',
      createdAt: new Date('2024-01-01'),
      status: 'published',
      title: 'Test Post',
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      facetFields: ['status'],
      searchFields: ['title', 'content'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      content: 'This is test content',
      createdAt: new Date('2024-01-01').getTime(),
      status: 'published',
      title: 'Test Post',
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should handle richText fields', () => {
    const doc = {
      id: '1',
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
      title: 'Test Post',
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      facetFields: [],
      searchFields: ['title', 'content'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      content: 'This is rich text content',
      createdAt: new Date('2024-01-01').getTime(),
      title: 'Test Post',
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should handle array fields with dot notation', () => {
    const doc = {
      id: '1',
      createdAt: new Date('2024-01-01'),
      tags: [{ tag: 'javascript' }, { tag: 'typescript' }],
      technologies: [
        { name: 'React', category: 'frontend' },
        { name: 'Node.js', category: 'backend' },
      ],
      title: 'Test Post',
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      facetFields: ['technologies.category'],
      searchFields: ['title', 'tags.tag', 'technologies.name'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      createdAt: new Date('2024-01-01').getTime(),
      'tags.tag': 'javascript typescript',
      'technologies.category': 'unknown',
      'technologies.name': 'React Node.js',
      title: 'Test Post',
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should handle missing fields with defaults', () => {
    const doc = {
      id: '1',
      createdAt: new Date('2024-01-01'),
      title: 'Test Post',
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      facetFields: ['status'],
      searchFields: ['title', 'content', 'description'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      content: '',
      createdAt: new Date('2024-01-01').getTime(),
      description: '',
      status: 'unknown',
      title: 'Test Post',
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should handle null and undefined values', () => {
    const doc = {
      id: '1',
      content: null,
      createdAt: new Date('2024-01-01'),
      description: undefined,
      title: 'Test Post',
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      facetFields: [],
      searchFields: ['title', 'content'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      content: '',
      createdAt: new Date('2024-01-01').getTime(),
      title: 'Test Post',
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should handle empty arrays', () => {
    const doc = {
      id: '1',
      categories: [],
      createdAt: new Date('2024-01-01'),
      tags: [],
      title: 'Test Post',
      updatedAt: new Date('2024-01-01'),
    }

    const collectionConfig = {
      enabled: true,
      facetFields: ['categories'],
      searchFields: ['title', 'tags.tag'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result).toEqual({
      id: '1',
      categories: '',
      createdAt: new Date('2024-01-01').getTime(),
      'tags.tag': '',
      title: 'Test Post',
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
      facetFields: [],
      searchFields: ['title', 'content'],
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
      facetFields: [],
      searchFields: ['title'],
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
      facetFields: [],
      searchFields: ['title'],
    }

    expect(() => {
      mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)
    }).toThrow("Document missing required 'id' field")
  })

  test('should handle missing collection config gracefully', () => {
    const doc = {
      id: '1',
      createdAt: new Date('2024-01-01'),
      title: 'Test Post',
      updatedAt: new Date('2024-01-01'),
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', undefined)

    expect(result).toEqual({
      id: '1',
      content: '',
      createdAt: new Date('2024-01-01').getTime(),
      description: '',
      title: 'Test Post',
      updatedAt: new Date('2024-01-01').getTime(),
    })
  })

  test('should convert all values to strings for search fields', () => {
    const doc = {
      id: '1',
      createdAt: new Date('2024-01-01'),
      published: true,
      title: 'Test Post',
      updatedAt: new Date('2024-01-01'),
      views: 100,
    }

    const collectionConfig = {
      enabled: true,
      facetFields: [],
      searchFields: ['title', 'views', 'published'],
    }

    const result = mapPayloadDocumentToTypesense(doc, 'posts', collectionConfig)

    expect(result.title).toBe('Test Post')
    expect(result.views).toBe('100')
    expect(result.published).toBe('true')
  })
})
