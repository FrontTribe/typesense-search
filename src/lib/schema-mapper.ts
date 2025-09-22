import type { CollectionConfig, Collection } from 'payload'
import type { TypesenseSearchConfig } from '../index.js'

// Helper function to extract text content from richText structure
const extractTextFromRichText = (richText: any): string => {
  if (!richText || !richText.root) {
    return ''
  }

  const extractText = (node: any): string => {
    if (typeof node === 'string') {
      return node
    }

    if (node && typeof node === 'object') {
      if (node.text) {
        return node.text
      }

      if (node.children && Array.isArray(node.children)) {
        return node.children.map(extractText).join('')
      }
    }

    return ''
  }

  return extractText(richText.root)
}

export const mapCollectionToTypesenseSchema = (
  collection: Collection,
  collectionSlug: string,
  config: NonNullable<TypesenseSearchConfig['collections']>[string] | undefined,
) => {
  const searchableFields = config?.searchFields || ['title', 'content', 'description']
  const facetFields = config?.facetFields || []
  
  console.log(`🔍 Schema mapper - Collection: ${collectionSlug}`)
  console.log(`🔍 Schema mapper - Search fields:`, searchableFields)
  console.log(`🔍 Schema mapper - Facet fields:`, facetFields)

  // Base fields that every collection should have
  const baseFields = [
    { name: 'id', type: 'string' as const },
    { name: 'createdAt', type: 'int64' as const },
    { name: 'updatedAt', type: 'int64' as const },
  ]

  // Map searchable fields
  const searchFields = searchableFields.map((field: string) => ({
    name: field,
    type: 'string' as const,
    facet: facetFields.includes(field),
  }))

  // Map facet-only fields (not in searchable fields)
  const facetOnlyFields = facetFields
    .filter((field: string) => !searchableFields.includes(field))
    .map((field: string) => ({
      name: field,
      type: 'string' as const,
      facet: true,
    }))

  return {
    name: collectionSlug,
    fields: [...baseFields, ...searchFields, ...facetOnlyFields],
  }
}

export const mapPayloadDocumentToTypesense = (
  doc: any,
  collectionSlug: string,
  config: NonNullable<TypesenseSearchConfig['collections']>[string] | undefined,
) => {
  const searchableFields = config?.searchFields || ['title', 'content', 'description']
  const facetFields = config?.facetFields || []

  // Validate required fields
  if (!doc.id) {
    throw new Error(`Document missing required 'id' field: ${JSON.stringify(doc)}`)
  }

  if (!doc.createdAt) {
    console.warn(`Document ${doc.id} missing 'createdAt' field, using current time`)
    doc.createdAt = new Date()
  }

  if (!doc.updatedAt) {
    console.warn(`Document ${doc.id} missing 'updatedAt' field, using current time`)
    doc.updatedAt = new Date()
  }

  // Base document structure with safe date handling
  const typesenseDoc: any = {
    id: String(doc.id), // Ensure ID is a string
    createdAt: new Date(doc.createdAt).getTime(),
    updatedAt: new Date(doc.updatedAt).getTime(),
  }

  // Add searchable fields with validation
  searchableFields.forEach((field: string) => {
    // Handle array fields with dot notation (e.g., 'technologies.name', 'tags.tag')
    if (field.includes('.')) {
      const [arrayField, subField] = field.split('.', 2)
      if (Array.isArray(doc[arrayField]) && doc[arrayField].length > 0) {
        typesenseDoc[field] = doc[arrayField].map((item: any) => item[subField] || '').join(' ')
      } else {
        typesenseDoc[field] = ''
      }
    } else if (doc[field] !== undefined && doc[field] !== null) {
      // Handle richText fields specially
      if (
        (field === 'content' || field === 'description') &&
        typeof doc[field] === 'object' &&
        doc[field].root
      ) {
        // Extract text from richText structure
        typesenseDoc[field] = extractTextFromRichText(doc[field])
      } else {
        // Convert to string for other fields
        typesenseDoc[field] = String(doc[field])
      }
    } else {
      // Set empty string for missing fields
      typesenseDoc[field] = ''
    }
  })

  // Add facet fields with validation - ensure all facet fields are present
  facetFields.forEach((field: string) => {
    if (doc[field] !== undefined && doc[field] !== null) {
      // Convert to string for facet fields
      typesenseDoc[field] = String(doc[field])
    } else {
      // Add default value for missing facet fields
      typesenseDoc[field] = 'unknown'
    }
  })

  // Validate that we have at least one searchable field
  const hasSearchableContent = searchableFields.some(
    (field: string) => typesenseDoc[field] && typesenseDoc[field].trim().length > 0,
  )

  if (!hasSearchableContent) {
    console.warn(`Document ${doc.id} has no searchable content, adding placeholder`)
    typesenseDoc.title = typesenseDoc.title || `Document ${doc.id}`
  }

  return typesenseDoc
}
