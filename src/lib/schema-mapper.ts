import type { CollectionConfig } from 'payload'
import type { TypesenseSearchConfig } from '../index.js'

export const mapCollectionToTypesenseSchema = (
  collection: CollectionConfig,
  config: TypesenseSearchConfig['collections'][string],
) => {
  const searchableFields = config?.searchFields || ['title', 'content', 'description']
  const facetFields = config?.facetFields || []

  // Base fields that every collection should have
  const baseFields = [
    { name: 'id', type: 'string' as const },
    { name: 'createdAt', type: 'int64' as const },
    { name: 'updatedAt', type: 'int64' as const },
  ]

  // Map searchable fields
  const searchFields = searchableFields.map((field) => ({
    name: field,
    type: 'string' as const,
    facet: facetFields.includes(field),
  }))

  // Map facet-only fields (not in searchable fields)
  const facetOnlyFields = facetFields
    .filter((field) => !searchableFields.includes(field))
    .map((field) => ({
      name: field,
      type: 'string' as const,
      facet: true,
    }))

  return {
    name: collection.slug,
    fields: [...baseFields, ...searchFields, ...facetOnlyFields],
  }
}

export const mapPayloadDocumentToTypesense = (
  doc: any,
  collectionSlug: string,
  config: TypesenseSearchConfig['collections'][string],
) => {
  const searchableFields = config?.searchFields || ['title', 'content', 'description']
  const facetFields = config?.facetFields || []

  // Base document structure
  const typesenseDoc: any = {
    id: doc.id,
    createdAt: new Date(doc.createdAt).getTime(),
    updatedAt: new Date(doc.updatedAt).getTime(),
  }

  // Add searchable fields
  searchableFields.forEach((field) => {
    if (doc[field] !== undefined) {
      typesenseDoc[field] = doc[field]
    }
  })

  // Add facet fields
  facetFields.forEach((field) => {
    if (doc[field] !== undefined) {
      typesenseDoc[field] = doc[field]
    }
  })

  return typesenseDoc
}
