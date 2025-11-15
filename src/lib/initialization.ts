import type { Payload } from 'payload'
import type Typesense from 'typesense'

import type { TypesenseSearchConfig } from '../index.js'

import { validateConfig } from './config-validation.js'
import { mapCollectionToTypesenseSchema, mapPayloadDocumentToTypesense } from './schema-mapper.js'
import { testTypesenseConnection } from './typesense-client.js'

export const initializeTypesenseCollections = async (
  payload: Payload,
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
) => {
  // Validate configuration first
  const validation = validateConfig(pluginOptions)
  if (!validation.success) {
    // Handle configuration validation error
    throw new Error('Invalid plugin configuration')
  }

  // Configuration validated successfully

  // Test Typesense connection first
  const isConnected = await testTypesenseConnection(typesenseClient)
  if (!isConnected) {
    // Typesense connection failed
    console.error('❌ Typesense connection failed. Collections will not be initialized.')
    return
  }
  console.log('✅ Typesense connection successful')

  // Initialize Typesense collections

  if (pluginOptions.collections) {
    for (const [collectionSlug, config] of Object.entries(pluginOptions.collections)) {
      if (config?.enabled) {
        try {
          await initializeCollection(payload, typesenseClient, collectionSlug, config, pluginOptions)
          console.log(`✅ Typesense collection "${collectionSlug}" initialized successfully`)
        } catch (error) {
          // Handle collection initialization error
          console.error(
            `❌ Failed to initialize Typesense collection "${collectionSlug}":`,
            error instanceof Error ? error.message : 'Unknown error',
          )
        }
      }
    }
  }

  // Collections initialized successfully
}

const initializeCollection = async (
  payload: Payload,
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  config: NonNullable<TypesenseSearchConfig['collections']>[string] | undefined,
  pluginOptions: TypesenseSearchConfig,
) => {
  // Get the collection config from Payload
  const collection = payload.collections[collectionSlug]
  if (!collection) {
    // Collection not found in Payload
    console.warn(`⚠️  Collection "${collectionSlug}" not found in Payload. Skipping Typesense initialization.`)
    return
  }

  // Create Typesense schema
  const schema = mapCollectionToTypesenseSchema(collection, collectionSlug, config)
  // Create schema for collection

  try {
    // Check if collection exists
    await typesenseClient.collections(collectionSlug).retrieve()
    // Collection already exists
  } catch (_error) {
    // Collection doesn't exist, create it
    try {
      await typesenseClient.collections().create(schema)
      console.log(`✅ Created Typesense collection "${collectionSlug}"`)
    } catch (createError) {
      // Handle collection creation error
      console.error(
        `❌ Failed to create Typesense collection "${collectionSlug}":`,
        createError instanceof Error ? createError.message : 'Unknown error',
      )
      throw createError
    }
  }

  // Sync existing documents
  await syncExistingDocuments(payload, typesenseClient, collectionSlug, config, pluginOptions)
}

const syncExistingDocuments = async (
  payload: Payload,
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  config: NonNullable<TypesenseSearchConfig['collections']>[string] | undefined,
  pluginOptions: TypesenseSearchConfig,
) => {
  try {
    // Calculate effective limit: collection-specific > global default > 1000
    const effectiveLimit =
      config?.syncLimit ?? pluginOptions.settings?.defaultSyncLimit ?? 1000

    // Fetch first page to determine total pages
    let page = 1
    let totalPages = 1
    let totalSynced = 0

    do {
      const result = await payload.find({
        collection: collectionSlug,
        depth: 0,
        limit: effectiveLimit,
        page,
      })

      const { docs, totalPages: pages } = result
      totalPages = pages ?? 1

      if (docs.length === 0) {
        // No documents to sync on this page
        break
      }

      // Log progress for large syncs
      if (totalPages > 1) {
        console.log(
          `📦 Syncing collection "${collectionSlug}": page ${page} of ${totalPages} (${docs.length} documents)`,
        )
      }

      // Batch sync documents
      const batchSize = 100
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize)
        const typesenseDocs = batch.map((doc) =>
          mapPayloadDocumentToTypesense(doc, collectionSlug, config),
        )

        try {
          const _importResult = await typesenseClient
            .collections(collectionSlug)
            .documents()
            .import(typesenseDocs, { action: 'upsert' })

          totalSynced += batch.length
          // Documents synced successfully
        } catch (batchError: any) {
          // Handle batch sync error

          // Log detailed import results if available
          if (batchError.importResults) {
            // Handle import results error

            // Try to sync documents individually to identify problematic ones
            // Attempt individual document sync
            for (let j = 0; j < typesenseDocs.length; j++) {
              try {
                await typesenseClient.collections(collectionSlug).documents().upsert(typesenseDocs[j])
                totalSynced++
                // Individual sync successful
              } catch (_individualError: any) {
                // Handle individual sync error
              }
            }
          }
        }
      }

      page++
    } while (page <= totalPages)

    if (totalSynced > 0) {
      console.log(
        `✅ Synced ${totalSynced} document${totalSynced === 1 ? '' : 's'} from collection "${collectionSlug}"`,
      )
    }

    // Successfully synced documents
  } catch (_error) {
    // Handle document sync error
    console.error(
      `❌ Failed to sync documents from collection "${collectionSlug}":`,
      _error instanceof Error ? _error.message : 'Unknown error',
    )
  }
}
