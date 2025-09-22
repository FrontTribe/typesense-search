import Typesense from 'typesense'
import type { Payload } from 'payload'
import type { TypesenseSearchConfig } from '../index.js'
import { mapPayloadDocumentToTypesense } from './schema-mapper.js'

export const setupHooks = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
  existingHooks?: any,
) => {
  const hooks = { ...existingHooks }

  if (pluginOptions.collections) {
    for (const [collectionSlug, config] of Object.entries(pluginOptions.collections)) {
      if (config.enabled) {
        // After create/update hook
        hooks.afterChange = {
          ...hooks.afterChange,
          [collectionSlug]: [
            ...(hooks.afterChange?.[collectionSlug] || []),
            async ({ doc, operation, req }) => {
              await syncDocumentToTypesense(typesenseClient, collectionSlug, doc, operation, config)
            },
          ],
        }

        // After delete hook
        hooks.afterDelete = {
          ...hooks.afterDelete,
          [collectionSlug]: [
            ...(hooks.afterDelete?.[collectionSlug] || []),
            async ({ doc, req }) => {
              await deleteDocumentFromTypesense(typesenseClient, collectionSlug, doc.id)
            },
          ],
        }
      }
    }
  }

  return hooks
}

const syncDocumentToTypesense = async (
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  doc: any,
  operation: 'create' | 'update',
  config: TypesenseSearchConfig['collections'][string],
) => {
  try {
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
    await typesenseClient.collections(collectionSlug).documents(docId).delete()

    console.log(`✅ Document deleted from Typesense:`, collectionSlug, docId)
  } catch (error) {
    console.error(`❌ Failed to delete document from Typesense:`, error)
  }
}
