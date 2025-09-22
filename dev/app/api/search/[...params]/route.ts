import { NextRequest, NextResponse } from 'next/server'
import Typesense from 'typesense'

const typesenseClient = new Typesense.Client({
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2,
})

const pluginOptions = {
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
      searchFields: ['title', 'description', 'shortDescription', 'technologies.name', 'tags.tag'],
      displayName: 'Portfolio',
      icon: '💼',
    },
  },
  settings: {
    categorized: true,
  },
}

export async function GET(request: NextRequest) {
  const { searchParams, pathname } = new URL(request.url)
  const pathSegments = pathname.split('/api/search/')[1]?.split('/') || []
  const collection = pathSegments[0]

  // Handle collections endpoint
  if (collection === 'collections') {
    try {
      const collections = Object.entries(pluginOptions.collections || {})
        .filter(([_, config]) => config.enabled)
        .map(([slug, config]) => ({
          slug,
          displayName: config.displayName || slug.charAt(0).toUpperCase() + slug.slice(1),
          icon: config.icon || '📄',
          searchFields: config.searchFields || [],
          facetFields: config.facetFields || [],
        }))

      return NextResponse.json({
        collections,
        categorized: pluginOptions.settings?.categorized || false,
      })
    } catch (error) {
      console.error('Collections handler error:', error)
      return NextResponse.json({ error: 'Failed to get collections' }, { status: 500 })
    }
  }

  // Debug logging (can be removed in production)
  // console.log('Custom search handler called with:', { collection, searchParams: Object.fromEntries(searchParams) })

  if (!collection) {
    return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 })
  }

  if (!pluginOptions.collections?.[collection]?.enabled) {
    return NextResponse.json({ error: 'Collection not enabled for search' }, { status: 400 })
  }

  const q = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const per_page = parseInt(searchParams.get('per_page') || '10')

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  try {
    const searchParameters: any = {
      q,
      query_by:
        pluginOptions.collections[
          collection as keyof typeof pluginOptions.collections
        ].searchFields?.join(',') || 'title,content',
      page,
      per_page,
      highlight_full_fields:
        pluginOptions.collections[
          collection as keyof typeof pluginOptions.collections
        ].searchFields?.join(',') || 'title,content',
      snippet_threshold: 30,
      num_typos: 0,
      typo_tokens_threshold: 1,
    }

    // Add facet filters
    const facetFields =
      pluginOptions.collections[collection as keyof typeof pluginOptions.collections].facetFields ||
      []
    const filters: string[] = []

    facetFields.forEach((field: string) => {
      const value = searchParams.get(field)
      if (value) {
        filters.push(`${field}:=${value}`)
      }
    })

    if (filters.length > 0) {
      searchParameters.filter_by = filters.join(' && ')
    }

    // Add sorting
    const sort_by = searchParams.get('sort_by')
    if (sort_by) {
      searchParameters.sort_by = sort_by
    }

    // console.log('Searching with parameters:', searchParameters)

    const searchResults = await typesenseClient
      .collections(collection)
      .documents()
      .search(searchParameters)

    return NextResponse.json(searchResults)
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url)
  const pathSegments = pathname.split('/api/search/')[1]?.split('/') || []
  const collection = pathSegments[0]

  if (!collection) {
    return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 })
  }

  if (!pluginOptions.collections?.[collection]?.enabled) {
    return NextResponse.json({ error: 'Collection not enabled for search' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { q, page = 1, per_page = 10, sort_by, filters = {} } = body

    if (!q) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    const searchParameters: any = {
      q,
      query_by:
        pluginOptions.collections[
          collection as keyof typeof pluginOptions.collections
        ].searchFields?.join(',') || 'title,content',
      page,
      per_page,
      highlight_full_fields:
        pluginOptions.collections[
          collection as keyof typeof pluginOptions.collections
        ].searchFields?.join(',') || 'title,content',
      snippet_threshold: 30,
      num_typos: 0,
      typo_tokens_threshold: 1,
    }

    // Add facet filters
    const facetFields =
      pluginOptions.collections[collection as keyof typeof pluginOptions.collections].facetFields ||
      []
    const filterArray: string[] = []

    facetFields.forEach((field: string) => {
      if (filters[field]) {
        filterArray.push(`${field}:=${filters[field]}`)
      }
    })

    if (filterArray.length > 0) {
      searchParameters.filter_by = filterArray.join(' && ')
    }

    if (sort_by) {
      searchParameters.sort_by = sort_by
    }

    const searchResults = await typesenseClient
      .collections(collection)
      .documents()
      .search(searchParameters)

    return NextResponse.json(searchResults)
  } catch (error: any) {
    console.error('Advanced search error:', error)
    return NextResponse.json({ error: 'Advanced search failed' }, { status: 500 })
  }
}
