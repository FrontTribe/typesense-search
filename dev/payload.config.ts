import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { typesenseSearch } from '../src/index.js'
import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

const buildConfigWithPostgres = async () => {
  return buildConfig({
    admin: {
      autoLogin: {
        email: process.env.PAYLOAD_EMAIL || 'admin@example.com',
        password: process.env.PAYLOAD_PASSWORD || 'admin123',
        prefillOnly: false,
      },
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
      {
        slug: 'products',
        fields: [
          {
            name: 'name',
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
            name: 'price',
            type: 'number',
            required: true,
          },
          {
            name: 'category',
            type: 'select',
            options: [
              { label: 'Electronics', value: 'electronics' },
              { label: 'Clothing', value: 'clothing' },
              { label: 'Books', value: 'books' },
              { label: 'Home & Garden', value: 'home-garden' },
              { label: 'Sports', value: 'sports' },
            ],
          },
          {
            name: 'brand',
            type: 'text',
          },
          {
            name: 'sku',
            type: 'text',
            unique: true,
          },
          {
            name: 'inStock',
            type: 'checkbox',
            defaultValue: true,
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
              { label: 'Discontinued', value: 'discontinued' },
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
    db: postgresAdapter({
      pool: {
        connectionString:
          process.env.DATABASE_URI || 'postgresql://payload:payload@localhost:5433/payload',
      },
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
            displayName: 'Media Files',
            enabled: true,
            facetFields: ['type'],
            icon: '🖼️',
            searchFields: ['filename', 'alt'],
          },
          portfolio: {
            displayName: 'Portfolio',
            enabled: true,
            facetFields: ['status', 'featured'],
            icon: '💼',
            searchFields: [
              'title',
              'description',
              'shortDescription',
              'technologies.name',
              'tags.tag',
            ],
          },
          posts: {
            displayName: 'Blog Posts',
            enabled: true,
            facetFields: ['category', 'status'],
            icon: '�',
            searchFields: ['title', 'content'],
          },
          products: {
            displayName: 'Products',
            enabled: true,
            facetFields: ['category', 'status', 'inStock', 'featured'],
            icon: '🛍️',
            searchFields: ['name', 'description', 'shortDescription', 'brand', 'tags.tag'],
            syncLimit: 5000, // Sync 5000 documents per page for large product collection
          },
        },
        settings: {
          autoSync: true,
          categorized: true,
          defaultSyncLimit: 1000, // Default limit for all collections
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

export default buildConfigWithPostgres()
