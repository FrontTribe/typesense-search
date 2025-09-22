#!/usr/bin/env node

/**
 * Typesense Search Plugin - Data Synchronization Script
 *
 * This script synchronizes data from Payload CMS to Typesense.
 * It can be used to:
 * - Clear all data from Typesense
 * - Sync all collections from Payload CMS to Typesense
 * - Sync specific collections
 *
 * Usage:
 *   pnpm sync                    # Sync all collections
 *   pnpm sync --clear           # Clear all Typesense data first
 *   pnpm sync --collections posts,media  # Sync specific collections
 *   pnpm sync --help            # Show help
 */

import { createRequire } from 'module'
import Typesense from 'typesense'

const require = createRequire(import.meta.url)

// Configuration
const TYPESENSE_CONFIG = {
  nodes: [
    {
      host: 'localhost',
      port: 8108,
      protocol: 'http',
    },
  ],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2,
}

const PAYLOAD_CONFIG = {
  url: 'http://localhost:3000',
  // Authentication - must be provided by user
  auth: {
    email: process.env.PAYLOAD_EMAIL || null,
    password: process.env.PAYLOAD_PASSWORD || null,
  },
  collections: {
    posts: {
      enabled: true,
      searchFields: ['title', 'content'],
      facetFields: ['category', 'status'],
    },
    media: {
      enabled: true,
      searchFields: ['filename', 'alt'],
      facetFields: ['type'],
    },
    portfolio: {
      enabled: true,
      searchFields: ['title', 'description', 'shortDescription', 'technologies.name', 'tags.tag'],
      facetFields: ['status', 'featured'],
    },
  },
}

// Authentication functions
let authToken = null

const authenticate = async () => {
  if (authToken) {
    return authToken
  }

  console.log('🔐 Authenticating with Payload CMS...')

  try {
    const response = await fetch(`${PAYLOAD_CONFIG.url}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: PAYLOAD_CONFIG.auth.email,
        password: PAYLOAD_CONFIG.auth.password,
      }),
    })

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    authToken = data.token

    console.log('   ✅ Authentication successful')
    return authToken
  } catch (error) {
    console.error('   ❌ Authentication failed:', error.message)
    throw error
  }
}

const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = await authenticate()

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
      ...options.headers,
    },
  })
}

// Helper function to extract text from richText structure
const extractTextFromRichText = (richText) => {
  if (!richText || !richText.root) {
    return ''
  }

  const extractText = (node) => {
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

// Map Payload document to Typesense document
const mapPayloadDocumentToTypesense = (doc, collectionSlug, config) => {
  const searchableFields = config?.searchFields || ['title', 'content', 'description']
  const facetFields = config?.facetFields || []

  // Base document structure with safe date handling
  const typesenseDoc = {
    id: String(doc.id),
    createdAt: new Date(doc.createdAt).getTime(),
    updatedAt: new Date(doc.updatedAt).getTime(),
  }

  // Add searchable fields with validation
  searchableFields.forEach((field) => {
    // Handle array fields with dot notation (e.g., 'technologies.name', 'tags.tag')
    if (field.includes('.')) {
      const [arrayField, subField] = field.split('.', 2)
      if (Array.isArray(doc[arrayField]) && doc[arrayField].length > 0) {
        typesenseDoc[field] = doc[arrayField].map((item) => item[subField] || '').join(' ')
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
  facetFields.forEach((field) => {
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
    (field) => typesenseDoc[field] && typesenseDoc[field].trim().length > 0,
  )

  if (!hasSearchableContent) {
    console.warn(`Document ${doc.id} has no searchable content, adding placeholder`)
    typesenseDoc.title = typesenseDoc.title || `Document ${doc.id}`
  }

  return typesenseDoc
}

// Create Typesense collection schema
const createCollectionSchema = (collectionSlug, config) => {
  const searchableFields = config?.searchFields || ['title', 'content', 'description']
  const facetFields = config?.facetFields || []

  // Base fields that every collection should have
  const baseFields = [
    { name: 'id', type: 'string' },
    { name: 'createdAt', type: 'int64' },
    { name: 'updatedAt', type: 'int64' },
  ]

  // Map searchable fields
  const searchFields = searchableFields.map((field) => ({
    name: field,
    type: 'string',
    facet: facetFields.includes(field),
  }))

  // Map facet-only fields (not in searchable fields)
  const facetOnlyFields = facetFields
    .filter((field) => !searchableFields.includes(field))
    .map((field) => ({
      name: field,
      type: 'string',
      facet: true,
    }))

  return {
    name: collectionSlug,
    fields: [...baseFields, ...searchFields, ...facetOnlyFields],
  }
}

// Clear all collections from Typesense
const clearTypesense = async (typesenseClient) => {
  console.log('🗑️  Clearing all collections from Typesense...')

  try {
    const collections = await typesenseClient.collections().retrieve()

    for (const collection of collections) {
      console.log(`   Deleting collection: ${collection.name}`)
      await typesenseClient.collections(collection.name).delete()
    }

    console.log('✅ All collections cleared from Typesense')
  } catch (error) {
    if (error.httpStatus === 404) {
      console.log('ℹ️  No collections found in Typesense')
    } else {
      throw error
    }
  }
}

// Sync a single collection
const syncCollection = async (typesenseClient, collectionSlug, config) => {
  console.log(`\n📦 Syncing collection: ${collectionSlug}`)

  try {
    // Check if collection exists, create if not
    try {
      await typesenseClient.collections(collectionSlug).retrieve()
      console.log(`   Collection ${collectionSlug} already exists`)
    } catch (error) {
      if (error.httpStatus === 404) {
        console.log(`   Creating collection: ${collectionSlug}`)
        const schema = createCollectionSchema(collectionSlug, config)
        await typesenseClient.collections().create(schema)
        console.log(`   ✅ Collection ${collectionSlug} created`)
      } else {
        throw error
      }
    }

    // Fetch data from Payload CMS with authentication
    console.log(`   Fetching data from Payload CMS...`)
    const response = await makeAuthenticatedRequest(`${PAYLOAD_CONFIG.url}/api/${collectionSlug}`)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${collectionSlug}: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    const documents = data.docs || []

    console.log(`   Found ${documents.length} documents`)

    if (documents.length === 0) {
      console.log(`   ⚠️  No documents found for ${collectionSlug}`)
      return
    }

    // Clear existing documents
    console.log(`   Clearing existing documents...`)
    try {
      await typesenseClient.collections(collectionSlug).documents().delete({ filter_by: 'id:*' })
    } catch (error) {
      // Ignore if no documents exist
    }

    // Batch import documents
    console.log(`   Importing ${documents.length} documents...`)
    const batchSize = 100
    const batches = []

    for (let i = 0; i < documents.length; i += batchSize) {
      batches.push(documents.slice(i, i + batchSize))
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const typesenseDocs = batch.map((doc) =>
        mapPayloadDocumentToTypesense(doc, collectionSlug, config),
      )

      try {
        await typesenseClient.collections(collectionSlug).documents().import(typesenseDocs)
        console.log(`   ✅ Batch ${i + 1}/${batches.length} imported (${batch.length} documents)`)
      } catch (error) {
        console.error(`   ❌ Failed to import batch ${i + 1}:`, error.message)
        throw error
      }
    }

    console.log(`   ✅ Collection ${collectionSlug} synced successfully`)
  } catch (error) {
    console.error(`   ❌ Failed to sync collection ${collectionSlug}:`, error.message)
    throw error
  }
}

// Main sync function
const syncData = async (options = {}) => {
  const { clear = false, collections = null, email = null, password = null } = options

  // Update auth credentials if provided
  if (email) {
    PAYLOAD_CONFIG.auth.email = email
  }
  if (password) {
    PAYLOAD_CONFIG.auth.password = password
  }

  // Validate that credentials are provided
  if (!PAYLOAD_CONFIG.auth.email || !PAYLOAD_CONFIG.auth.password) {
    console.error('❌ Authentication credentials are required!')
    console.error('')
    console.error('Please provide your Payload CMS admin credentials using one of these methods:')
    console.error('')
    console.error('1. Command line arguments:')
    console.error('   pnpm sync --email your@email.com --password yourpassword')
    console.error('')
    console.error('2. Environment variables:')
    console.error('   PAYLOAD_EMAIL=your@email.com PAYLOAD_PASSWORD=yourpassword pnpm sync')
    console.error('')
    console.error('3. Set them in the script configuration')
    console.error('')
    process.exit(1)
  }

  console.log('🚀 Starting Typesense data synchronization...')
  console.log(`   Payload CMS URL: ${PAYLOAD_CONFIG.url}`)
  console.log(`   Typesense: ${TYPESENSE_CONFIG.nodes[0].host}:${TYPESENSE_CONFIG.nodes[0].port}`)
  console.log(`   Admin Email: ${PAYLOAD_CONFIG.auth.email}`)

  const typesenseClient = new Typesense.Client(TYPESENSE_CONFIG)

  try {
    // Test Typesense connection
    console.log('\n🔌 Testing Typesense connection...')
    await typesenseClient.health.retrieve()
    console.log('   ✅ Typesense connection successful')

    // Clear all data if requested
    if (clear) {
      await clearTypesense(typesenseClient)
    }

    // Determine which collections to sync
    const collectionsToSync = collections
      ? collections.split(',').map((c) => c.trim())
      : Object.keys(PAYLOAD_CONFIG.collections).filter(
          (slug) => PAYLOAD_CONFIG.collections[slug].enabled,
        )

    console.log(`\n📋 Collections to sync: ${collectionsToSync.join(', ')}`)

    // Sync each collection
    for (const collectionSlug of collectionsToSync) {
      const config = PAYLOAD_CONFIG.collections[collectionSlug]
      if (!config) {
        console.log(`   ⚠️  Collection ${collectionSlug} not configured, skipping`)
        continue
      }

      await syncCollection(typesenseClient, collectionSlug, config)
    }

    console.log('\n🎉 Data synchronization completed successfully!')

    // Show summary
    console.log('\n📊 Summary:')
    for (const collectionSlug of collectionsToSync) {
      try {
        const collection = await typesenseClient.collections(collectionSlug).retrieve()
        console.log(`   ${collectionSlug}: ${collection.num_documents} documents`)
      } catch (error) {
        console.log(`   ${collectionSlug}: Error retrieving count`)
      }
    }
  } catch (error) {
    console.error('\n❌ Synchronization failed:', error.message)
    process.exit(1)
  }
}

// Parse command line arguments
const parseArgs = () => {
  const args = process.argv.slice(2)
  const options = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--clear':
        options.clear = true
        break
      case '--collections':
        options.collections = args[i + 1]
        i++ // Skip next argument as it's the value
        break
      case '--email':
        options.email = args[i + 1]
        i++ // Skip next argument as it's the value
        break
      case '--password':
        options.password = args[i + 1]
        i++ // Skip next argument as it's the value
        break
      case '--help':
      case '-h':
        console.log(`
Typesense Search Plugin - Data Synchronization Script

Usage:
  pnpm sync --email your@email.com --password yourpassword  # Required: provide credentials
  pnpm sync --clear --email your@email.com --password yourpassword
  pnpm sync --collections posts,media --email your@email.com --password yourpassword
  pnpm sync --help            # Show this help

Options:
  --clear                     Clear all Typesense data before syncing
  --collections <list>        Comma-separated list of collections to sync
  --email <email>             Payload CMS admin email (REQUIRED)
  --password <password>       Payload CMS admin password (REQUIRED)
  --help, -h                  Show this help message

Environment Variables:
  PAYLOAD_EMAIL               Admin email (alternative to --email)
  PAYLOAD_PASSWORD            Admin password (alternative to --password)

Examples:
  # Using command line arguments
  pnpm sync --email admin@mysite.com --password mypassword
  pnpm sync --clear --email admin@mysite.com --password mypassword
  pnpm sync --collections posts,portfolio --email admin@mysite.com --password mypassword

  # Using environment variables
  PAYLOAD_EMAIL=admin@mysite.com PAYLOAD_PASSWORD=mypassword pnpm sync
  PAYLOAD_EMAIL=admin@mysite.com PAYLOAD_PASSWORD=mypassword pnpm sync --clear

Note:
  This script requires Payload CMS to be running and accessible.
  You MUST provide your Payload CMS admin credentials to authenticate.
        `)
        process.exit(0)
        break
      default:
        if (arg.startsWith('--')) {
          console.error(`Unknown option: ${arg}`)
          console.error('Use --help for usage information')
          process.exit(1)
        }
    }
  }

  return options
}

// Run the script
const main = async () => {
  try {
    const options = parseArgs()
    await syncData(options)
  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run the main function
main()
