import type { CollectionSlug, Config } from 'payload'
import Typesense from 'typesense'

import { customEndpointHandler } from './endpoints/customEndpointHandler.js'
import { createSearchEndpoints } from './endpoints/search.js'
import { createTypesenseClient } from './lib/typesense-client.js'
import { initializeTypesenseCollections } from './lib/initialization.js'
import { mapPayloadDocumentToTypesense } from './lib/schema-mapper.js'

export type TypesenseSearchConfig = {
  /**
   * Typesense server configuration
   */
  typesense: {
    nodes: Array<{
      host: string
      port: string | number
      protocol: 'http' | 'https'
    }>
    apiKey: string
    connectionTimeoutSeconds?: number
  }

  /**
   * Collections to index in Typesense
   */
  collections?: Partial<
    Record<
      CollectionSlug,
      {
        enabled: boolean
        searchFields?: string[]
        facetFields?: string[]
        sortFields?: string[]
      }
    >
  >

  /**
   * Global plugin settings
   */
  settings?: {
    autoSync?: boolean
    batchSize?: number
    searchEndpoint?: string
  }

  disabled?: boolean
}

export const typesenseSearch =
  (pluginOptions: TypesenseSearchConfig) =>
  (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    // Initialize Typesense client
    const typesenseClient = createTypesenseClient(pluginOptions.typesense)

    // Add search endpoints
    config.endpoints = [
      ...(config.endpoints || []),
      ...createSearchEndpoints(typesenseClient, pluginOptions),
    ]

    // Add admin components
    config.admin = {
      ...config.admin,
      components: {
        ...config.admin?.components,
        beforeDashboard: [
          ...(config.admin?.components?.beforeDashboard || []),
          `typesense-search/client#BeforeDashboardClient`,
          `typesense-search/rsc#BeforeDashboardServer`,
        ],
      },
    }

    // Apply hooks to individual collections
    if (pluginOptions.settings?.autoSync !== false && pluginOptions.collections) {
      config.collections = config.collections?.map((collection) => {
        const collectionConfig = pluginOptions.collections?.[collection.slug]

        if (collectionConfig?.enabled) {
          return {
            ...collection,
            hooks: {
              ...collection.hooks,
              afterChange: [
                ...(collection.hooks?.afterChange || []),
                async ({ doc, operation, req }) => {
                  await syncDocumentToTypesense(
                    typesenseClient,
                    collection.slug,
                    doc,
                    operation,
                    collectionConfig,
                  )
                },
              ],
              afterDelete: [
                ...(collection.hooks?.afterDelete || []),
                async ({ doc, req }) => {
                  await deleteDocumentFromTypesense(typesenseClient, collection.slug, doc.id)
                },
              ],
            },
          }
        }

        return collection
      })
    }

    // Initialize collections in Typesense
    const incomingOnInit = config.onInit
    config.onInit = async (payload) => {
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      await initializeTypesenseCollections(payload, typesenseClient, pluginOptions)
    }

    return config
  }

// Helper function to create collection if it doesn't exist
const createCollectionIfNotExists = async (
  typesenseClient: Typesense.Client,
  collectionSlug: string,
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

  const schema = {
    name: collectionSlug,
    fields: [...baseFields, ...searchFields, ...facetOnlyFields],
  }

  await typesenseClient.collections().create(schema)
  console.log(`✅ Created collection ${collectionSlug} in Typesense`)
}

// Sync functions for hooks
const syncDocumentToTypesense = async (
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  doc: any,
  operation: 'create' | 'update',
  config: TypesenseSearchConfig['collections'][string],
) => {
  try {
    // First check if the collection exists, create it if it doesn't
    try {
      await typesenseClient.collections(collectionSlug).retrieve()
    } catch (collectionError: any) {
      if (collectionError.httpStatus === 404) {
        console.log(`ℹ️  Collection ${collectionSlug} not found, creating it...`)
        await createCollectionIfNotExists(typesenseClient, collectionSlug, config)
      } else {
        throw collectionError
      }
    }

    const typesenseDoc = mapPayloadDocumentToTypesense(doc, collectionSlug, config)
    await typesenseClient.collections(collectionSlug).documents().upsert(typesenseDoc)

    console.log(`✅ Document ${operation}d in Typesense:`, collectionSlug, doc.id)
  } catch (error: any) {
    console.error(`❌ Failed to sync document to Typesense:`, error.message)
    console.error(`   Collection: ${collectionSlug}`)
    console.error(`   Document ID: ${doc.id}`)
    console.error(`   Operation: ${operation}`)

    // Log the problematic document for debugging
    if (error.message.includes('validation')) {
      console.error(`   Problematic document:`, JSON.stringify(doc, null, 2))
    }
  }
}

const deleteDocumentFromTypesense = async (
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  docId: string,
) => {
  try {
    // First check if the collection exists
    try {
      await typesenseClient.collections(collectionSlug).retrieve()
    } catch (collectionError: any) {
      if (collectionError.httpStatus === 404) {
        console.log(`ℹ️  Collection ${collectionSlug} not found in Typesense, skipping delete`)
        return
      }
      throw collectionError
    }

    // Try to delete the document
    await typesenseClient.collections(collectionSlug).documents(docId).delete()
    console.log(`✅ Document deleted from Typesense:`, collectionSlug, docId)
  } catch (error: any) {
    // Handle specific error cases
    if (error.httpStatus === 404) {
      console.log(
        `ℹ️  Document ${docId} not found in Typesense collection ${collectionSlug}, already deleted`,
      )
    } else {
      console.error(`❌ Failed to delete document from Typesense:`, error.message)
      console.error(`   Collection: ${collectionSlug}`)
      console.error(`   Document ID: ${docId}`)
    }
  }
}
