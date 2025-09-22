import type { PayloadHandler } from 'payload'
import type { TypesenseSearchConfig } from '../index.js'
import Typesense from 'typesense'

export const createSearchEndpoints = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
) => {
  return [
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
  return async ({ params, req }) => {
    const { collection } = params || {}
    const { q, page = 1, per_page = 10, sort_by, ...filters } = req?.query || {}

    // Debug logging
    console.log('Search handler called with:', { collection, params, query: req?.query })

    if (!collection) {
      return Response.json({ error: 'Collection parameter is required' }, { status: 400 })
    }

    if (!pluginOptions.collections?.[collection]?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    if (!q) {
      return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    try {
      const searchParameters: any = {
        q: q as string,
        query_by: pluginOptions.collections[collection].searchFields?.join(',') || 'title,content',
        page: Number(page),
        per_page: Number(per_page),
        highlight_full_fields:
          pluginOptions.collections[collection].searchFields?.join(',') || 'title,content',
        snippet_threshold: 30,
        num_typos: 2,
        typo_tokens_threshold: 1,
      }

      // Add sorting
      if (sort_by) {
        searchParameters.sort_by = sort_by as string
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
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
  return async ({ params, req }) => {
    const { collection } = params || {}
    const body = (await req?.json?.()) || {}

    if (!pluginOptions.collections?.[collection]?.enabled) {
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
  return async ({ params, req }) => {
    const { collection } = params || {}
    const { q, limit = 5 } = req?.query || {}

    if (!pluginOptions.collections?.[collection]?.enabled) {
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
            pluginOptions.collections[collection].searchFields?.join(',') || 'title,content',
          per_page: Number(limit),
          highlight_full_fields:
            pluginOptions.collections[collection].searchFields?.join(',') || 'title,content',
          snippet_threshold: 30,
        })

      return Response.json(suggestResults)
    } catch (error) {
      console.error('Suggest error:', error)
      return Response.json({ error: 'Suggest failed' }, { status: 500 })
    }
  }
}
