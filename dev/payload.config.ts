import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { typesenseSearch } from 'typesense-search'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

const buildConfigWithMemoryDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    const memoryDB = await MongoMemoryReplSet.create({
      replSet: {
        count: 3,
        dbName: 'payloadmemory',
      },
    })

    process.env.DATABASE_URI = `${memoryDB.getUri()}&retryWrites=true`
  }

  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
    },
    collections: [
      {
        slug: 'posts',
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
          },
          {
            name: 'content',
            type: 'richText',
          },
          {
            name: 'category',
            type: 'text',
          },
          {
            name: 'status',
            type: 'select',
            defaultValue: 'draft',
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' },
            ],
          },
        ],
      },
      {
        slug: 'media',
        fields: [
          {
            name: 'filename',
            type: 'text',
          },
          {
            name: 'alt',
            type: 'text',
          },
          {
            name: 'type',
            type: 'text',
          },
        ],
        upload: {
          staticDir: path.resolve(dirname, 'media'),
        },
      },
    ],
    db: mongooseAdapter({
      ensureIndexes: true,
      url: process.env.DATABASE_URI || '',
    }),
    editor: lexicalEditor(),
    email: testEmailAdapter,
    onInit: async (payload) => {
      await seed(payload)
    },
    plugins: [
      typesenseSearch({
        collections: {
          media: {
            enabled: true,
            facetFields: ['type'],
            searchFields: ['filename', 'alt'],
          },
          posts: {
            enabled: true,
            facetFields: ['category', 'status'],
            searchFields: ['title', 'content'],
          },
        },
        settings: {
          autoSync: true,
          searchEndpoint: '/api/search',
        },
        typesense: {
          apiKey: 'xyz',
          connectionTimeoutSeconds: 2,
          nodes: [
            {
              host: 'localhost',
              port: 8108,
              protocol: 'http',
            },
          ],
        },
      }),
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  })
}

export default buildConfigWithMemoryDB()
