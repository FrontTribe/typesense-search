import type { PayloadHandler } from 'payload'
import Typesense from 'typesense'
import type { TypesenseSearchConfig } from '../index.js'

export const createSearchEndpoints = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
) => {
  return [
    {
      method: 'get' as const,
      path: '/search/collections',
      handler: createCollectionsHandler(pluginOptions),
    },
    {
      method: 'get' as const,
      path: '/search/:collection',
      handler: createSearchHandler(typesenseClient, pluginOptions),
    },
    {
      method: 'post' as const,
      path: '/search/:collection',
      handler: createAdvancedSearchHandler(typesenseClient, pluginOptions),
    },
    {
      method: 'get' as const,
      path: '/search/:collection/suggest',
      handler: createSuggestHandler(typesenseClient, pluginOptions),
    },
  ]
}

const createSearchHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
): PayloadHandler => {
  return async (request: any) => {
    const { params, req } = request
    const { collection } = (params as any) || {}
    const { q, page = 1, per_page = 10, sort_by, ...filters } = (req as any)?.query || {}

    // Debug logging
    console.log('Search handler called with:', { collection, params, query: (req as any)?.query })

    if (!collection) {
      return Response.json({ error: 'Collection parameter is required' }, { status: 400 })
    }

    if (!pluginOptions.collections?.[collection as any]?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    if (!q) {
      return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    try {
      const searchParameters: any = {
        q: q as string,
        query_by:
          pluginOptions.collections?.[collection as any]?.searchFields?.join(',') ||
          'title,content',
        page: Number(page),
        per_page: Number(per_page),
        highlight_full_fields:
          pluginOptions.collections?.[collection as any]?.searchFields?.join(',') ||
          'title,content',
        snippet_threshold: 30,
        num_typos: 2,
        typo_tokens_threshold: 1,
      }

      // Add sorting
      if (sort_by) {
        searchParameters.sort_by = sort_by as string
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]: [string, any]) => {
        if (value) {
          searchParameters[`filter_by`] = `${key}:=${value}`
        }
      })

      const searchResults = await typesenseClient
        .collections(collection)
        .documents()
        .search(searchParameters)

      return Response.json(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      return Response.json({ error: 'Search failed' }, { status: 500 })
    }
  }
}

const createAdvancedSearchHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
): PayloadHandler => {
  return async (request: any) => {
    const { params, req } = request
    const { collection } = (params as any) || {}
    const body = (await (req as any)?.json?.()) || {}

    if (!pluginOptions.collections?.[collection as any]?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    try {
      const searchResults = await typesenseClient.collections(collection).documents().search(body)

      return Response.json(searchResults)
    } catch (error) {
      console.error('Advanced search error:', error)
      return Response.json({ error: 'Advanced search failed' }, { status: 500 })
    }
  }
}

const createSuggestHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
): PayloadHandler => {
  return async (request: any) => {
    const { params, req } = request
    const { collection } = (params as any) || {}
    const { q, limit = 5 } = (req as any)?.query || {}

    if (!pluginOptions.collections?.[collection as any]?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    if (!q) {
      return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    try {
      const suggestResults = await typesenseClient
        .collections(collection)
        .documents()
        .search({
          q: q as string,
          query_by:
            pluginOptions.collections?.[collection]?.searchFields?.join(',') || 'title,content',
          per_page: Number(limit),
          highlight_full_fields:
            pluginOptions.collections?.[collection]?.searchFields?.join(',') || 'title,content',
          snippet_threshold: 30,
        })

      return Response.json(suggestResults)
    } catch (error) {
      console.error('Suggest error:', error)
      return Response.json({ error: 'Suggest failed' }, { status: 500 })
    }
  }
}

const createCollectionsHandler = (pluginOptions: TypesenseSearchConfig): PayloadHandler => {
  return async () => {
    try {
      const collections = Object.entries(pluginOptions.collections || {})
        .filter(([_, config]) => config?.enabled)
        .map(([slug, config]) => ({
          slug,
          displayName: config?.displayName || slug.charAt(0).toUpperCase() + slug.slice(1),
          icon: config?.icon || '📄',
          searchFields: config?.searchFields || [],
          facetFields: config?.facetFields || [],
        }))

      return Response.json({
        collections,
        categorized: pluginOptions.settings?.categorized || false,
      })
    } catch (error) {
      console.error('Collections handler error:', error)
      return Response.json({ error: 'Failed to get collections' }, { status: 500 })
    }
  }
}
