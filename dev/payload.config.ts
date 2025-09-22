import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { typesenseSearch } from '../src/index.js'
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
      {
        slug: 'portfolio',
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
          },
          {
            name: 'description',
            type: 'richText',
          },
          {
            name: 'shortDescription',
            type: 'text',
          },
          {
            name: 'technologies',
            type: 'array',
            fields: [
              {
                name: 'name',
                type: 'text',
                required: true,
              },
              {
                name: 'category',
                type: 'select',
                options: [
                  { label: 'Frontend', value: 'frontend' },
                  { label: 'Backend', value: 'backend' },
                  { label: 'Database', value: 'database' },
                  { label: 'DevOps', value: 'devops' },
                  { label: 'Design', value: 'design' },
                ],
              },
            ],
          },
          {
            name: 'projectUrl',
            type: 'text',
          },
          {
            name: 'githubUrl',
            type: 'text',
          },
          {
            name: 'featured',
            type: 'checkbox',
            defaultValue: false,
          },
          {
            name: 'status',
            type: 'select',
            defaultValue: 'draft',
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Published', value: 'published' },
              { label: 'Archived', value: 'archived' },
            ],
          },
          {
            name: 'tags',
            type: 'array',
            fields: [
              {
                name: 'tag',
                type: 'text',
                required: true,
              },
            ],
          },
        ],
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
            displayName: 'Media Files',
            icon: '🖼️',
          },
          posts: {
            enabled: true,
            facetFields: ['category', 'status'],
            searchFields: ['title', 'content'],
            displayName: 'Blog Posts',
            icon: '📝',
          },
          portfolio: {
            enabled: true,
            facetFields: ['status', 'featured'],
            searchFields: [
              'title',
              'description',
              'shortDescription',
              'technologies.name',
              'tags.tag',
            ],
            displayName: 'Portfolio',
            icon: '💼',
          },
        },
        settings: {
          autoSync: true,
          searchEndpoint: '/api/search',
          categorized: true,
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
