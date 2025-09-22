import Typesense from 'typesense'
import type { Payload } from 'payload'
import type { TypesenseSearchConfig } from '../index.js'
import { mapCollectionToTypesenseSchema } from './schema-mapper.js'
import { testTypesenseConnection } from './typesense-client.js'

export const initializeTypesenseCollections = async (
  payload: Payload,
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
) => {
  // Test Typesense connection first
  const isConnected = await testTypesenseConnection(typesenseClient)
  if (!isConnected) {
    console.warn('⚠️ Typesense connection failed. Search functionality will not be available.')
    return
  }

  console.log('🔍 Initializing Typesense collections...')

  if (pluginOptions.collections) {
    for (const [collectionSlug, config] of Object.entries(pluginOptions.collections)) {
      if (config.enabled) {
        try {
          await initializeCollection(payload, typesenseClient, collectionSlug, config)
        } catch (error) {
          console.error(`❌ Failed to initialize collection ${collectionSlug}:`, error)
        }
      }
    }
  }

  console.log('✅ Typesense collections initialized successfully')
}

const initializeCollection = async (
  payload: Payload,
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  config: TypesenseSearchConfig['collections'][string],
) => {
  // Get the collection config from Payload
  const collection = payload.collections[collectionSlug]
  if (!collection) {
    console.warn(`⚠️ Collection ${collectionSlug} not found in Payload`)
    return
  }

  // Create Typesense schema
  const schema = mapCollectionToTypesenseSchema(collection, config)
  console.log(`🔍 Creating schema for ${collectionSlug}:`, JSON.stringify(schema, null, 2))

  try {
    // Check if collection exists
    await typesenseClient.collections(collectionSlug).retrieve()
    console.log(`✅ Collection ${collectionSlug} already exists in Typesense`)
  } catch (error) {
    // Collection doesn't exist, create it
    try {
      await typesenseClient.collections().create(schema)
      console.log(`✅ Created Typesense collection: ${collectionSlug}`)
    } catch (createError) {
      console.error(`❌ Failed to create collection ${collectionSlug}:`, createError)
      console.error(`❌ Schema was:`, JSON.stringify(schema, null, 2))
      return
    }
  }

  // Sync existing documents
  await syncExistingDocuments(payload, typesenseClient, collectionSlug, config)
}

const syncExistingDocuments = async (
  payload: Payload,
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  config: TypesenseSearchConfig['collections'][string],
) => {
  try {
    const { docs } = await payload.find({
      collection: collectionSlug,
      limit: 1000, // Adjust based on your needs
      depth: 0,
    })

    if (docs.length === 0) {
      console.log(`ℹ️ No documents to sync for collection ${collectionSlug}`)
      return
    }

    // Batch sync documents
    const batchSize = 100
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize)
      const typesenseDocs = batch.map((doc) =>
        mapPayloadDocumentToTypesense(doc, collectionSlug, config),
      )

      try {
        await typesenseClient
          .collections(collectionSlug)
          .documents()
          .import(typesenseDocs, { action: 'upsert' })

        console.log(`✅ Synced ${batch.length} documents to ${collectionSlug}`)
      } catch (batchError) {
        console.error(`❌ Failed to sync batch for ${collectionSlug}:`, batchError)
      }
    }

    console.log(
      `✅ Synced ${docs.length} existing documents to Typesense collection: ${collectionSlug}`,
    )
  } catch (error) {
    console.error(`❌ Failed to sync existing documents for ${collectionSlug}:`, error)
  }
}
