import type { PayloadHandler } from 'payload'
import Typesense from 'typesense'
import type { TypesenseSearchConfig } from '../index.js'
import { searchCache } from '../lib/cache.js'
import { validateSearchParams, getValidationErrors } from '../lib/config-validation.js'
import { createHealthCheckHandler, createDetailedHealthCheckHandler } from './health.js'

// Universal search across all collections
const searchAllCollections = async (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
  query: string,
  options: { page: number; per_page: number; sort_by?: string; filters: any },
) => {
  try {
    console.log('=== UNIVERSAL SEARCH START ===')
    console.log('Query:', query)
    console.log('Options:', options)
    console.log('Plugin options collections:', Object.keys(pluginOptions.collections || {}))

    // Check cache first
    const cacheKey = `universal:${query}:${options.page}:${options.per_page}`
    const cachedResult = searchCache.get(query, 'universal', options)
    if (cachedResult) {
      console.log('Returning cached result for query:', query)
      return Response.json(cachedResult)
    }

    const enabledCollections = Object.entries(pluginOptions.collections || {}).filter(
      ([_, config]) => config?.enabled,
    )

    console.log(
      'Enabled collections:',
      enabledCollections.map(([name]) => name),
    )

    if (enabledCollections.length === 0) {
      return Response.json({ error: 'No collections enabled for search' }, { status: 400 })
    }

    // Search all collections in parallel
    const searchPromises = enabledCollections.map(async ([collectionName, config]) => {
      try {
        const searchParameters: any = {
          q: query,
          query_by: config?.searchFields?.join(',') || 'title,content',
          page: options.page,
          per_page: Math.ceil(options.per_page / enabledCollections.length), // Distribute results across collections
          highlight_full_fields: config?.searchFields?.join(',') || 'title,content',
          snippet_threshold: 30,
          num_typos: 0,
          typo_tokens_threshold: 1,
        }

        console.log(
          `Searching collection ${collectionName} with query: "${query}"`,
          searchParameters,
        )

        const results = await typesenseClient
          .collections(collectionName)
          .documents()
          .search(searchParameters)

        console.log(`Results for ${collectionName}:`, {
          found: results.found,
          hits: results.hits?.length,
        })

        // Add collection metadata to each hit
        return {
          collection: collectionName,
          displayName: config?.displayName || collectionName,
          icon: config?.icon || '📄',
          ...results,
          hits:
            results.hits?.map((hit) => ({
              ...hit,
              collection: collectionName,
              displayName: config?.displayName || collectionName,
              icon: config?.icon || '📄',
            })) || [],
        }
      } catch (error) {
        console.error(`Search error in collection ${collectionName}:`, error)
        return {
          collection: collectionName,
          displayName: config?.displayName || collectionName,
          icon: config?.icon || '📄',
          found: 0,
          hits: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    })

    const results = await Promise.all(searchPromises)

    // Combine results
    const combinedHits = results.flatMap((result) => result.hits || [])
    const totalFound = results.reduce((sum, result) => sum + (result.found || 0), 0)

    // Sort combined results by relevance (text_match score)
    combinedHits.sort((a, b) => (b.text_match || 0) - (a.text_match || 0))

    const searchResult = {
      found: totalFound,
      hits: combinedHits.slice(0, options.per_page),
      page: options.page,
      request_params: { q: query, per_page: options.per_page },
      search_cutoff: false,
      search_time_ms: 0,
      collections: results.map((r) => ({
        collection: r.collection,
        displayName: r.displayName,
        icon: r.icon,
        found: r.found || 0,
        error: r.error,
      })),
    }

    // Cache the result
    searchCache.set(query, searchResult, 'universal', options)

    return Response.json(searchResult)
  } catch (error) {
    console.error('Universal search error:', error)
    return Response.json(
      {
        error: 'Universal search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export const createSearchEndpoints = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
  lastSyncTime?: number,
) => {
  return [
    {
      method: 'get' as const,
      path: '/search/collections',
      handler: createCollectionsHandler(pluginOptions),
    },
    {
      method: 'get' as const,
      path: '/search/:collectionName/suggest',
      handler: createSuggestHandler(typesenseClient, pluginOptions),
    },
    {
      method: 'get' as const,
      path: '/search/:collectionName',
      handler: createSearchHandler(typesenseClient, pluginOptions),
    },
    {
      method: 'post' as const,
      path: '/search/:collectionName',
      handler: createAdvancedSearchHandler(typesenseClient, pluginOptions),
    },
    {
      method: 'get' as const,
      path: '/search',
      handler: createSearchHandler(typesenseClient, pluginOptions),
    },
    {
      method: 'get' as const,
      path: '/search/health',
      handler: createHealthCheckHandler(typesenseClient, pluginOptions, lastSyncTime),
    },
    {
      method: 'get' as const,
      path: '/search/health/detailed',
      handler: createDetailedHealthCheckHandler(typesenseClient, pluginOptions, lastSyncTime),
    },
  ]
}

const createSearchHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
): PayloadHandler => {
  return async (request: any) => {
    try {
      // Extract query parameters from the request
      const { params, query } = request
      const { collectionName } = params || {}

      // Extract search parameters
      const q = query?.q || ''
      const page = parseInt(query?.page || '1', 10)
      const per_page = parseInt(query?.per_page || '10', 10)
      const sort_by = query?.sort_by

      console.log('Search handler called with:', { q, page, per_page, sort_by, collectionName })

      // Validate search parameters
      const searchParams = { q, page, per_page, sort_by }
      const validation = validateSearchParams(searchParams)
      if (!validation.success) {
        return Response.json(
          {
            error: 'Invalid search parameters',
            details: getValidationErrors(validation.errors || []),
          },
          { status: 400 }
        )
      }

      // If no collection specified, search across all enabled collections
      if (!collectionName) {
        if (!q || q.trim() === '') {
          return Response.json(
            {
              error: 'Query parameter "q" is required',
              details: 'Please provide a search query using ?q=your_search_term',
              example: '/api/search?q=example',
            },
            { status: 400 },
          )
        }

        return await searchAllCollections(typesenseClient, pluginOptions, q, {
          page,
          per_page,
          sort_by,
          filters: {},
        })
      }

      // Validate collection is enabled
      if (!pluginOptions.collections?.[collectionName]?.enabled) {
        return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
      }

      if (!q) {
        return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
      }

      const searchParameters: any = {
        q: q as string,
        query_by:
          pluginOptions.collections?.[collectionName]?.searchFields?.join(',') || 'title,content',
        page: Number(page),
        per_page: Number(per_page),
        highlight_full_fields:
          pluginOptions.collections?.[collectionName]?.searchFields?.join(',') || 'title,content',
        snippet_threshold: 30,
        num_typos: 0,
        typo_tokens_threshold: 1,
      }

      // Add sorting
      if (sort_by) {
        searchParameters.sort_by = sort_by as string
      }

      console.log('Executing Typesense search with parameters:', searchParameters)

      // Check cache first
      const cacheOptions = { page, per_page, sort_by, collection: collectionName }
      const cachedResult = searchCache.get(q, collectionName, cacheOptions)
      if (cachedResult) {
        console.log('Returning cached result for collection:', collectionName)
        return Response.json(cachedResult)
      }

      const searchResults = await typesenseClient
        .collections(collectionName)
        .documents()
        .search(searchParameters)

      console.log('Search results:', searchResults)
      
      // Cache the result
      searchCache.set(q, searchResults, collectionName, cacheOptions)
      
      return Response.json(searchResults)
    } catch (error) {
      console.error('Search handler error:', error)
      return Response.json(
        {
          error: 'Search handler failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      )
    }
  }
}

const createAdvancedSearchHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
): PayloadHandler => {
  return async (request: any) => {
    const { params, req } = request
    const { collectionName } = (params as any) || {}
    const body = (await (req as any)?.json?.()) || {}

    if (!pluginOptions.collections?.[collectionName as any]?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    try {
      const searchResults = await typesenseClient
        .collections(collectionName)
        .documents()
        .search(body)

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
    // Extract collection name from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const collectionName = pathParts[pathParts.indexOf('search') + 1]

    // Extract query parameters
    const q = url.searchParams.get('q')
    const limit = url.searchParams.get('limit') || '5'

    if (!collectionName || !pluginOptions.collections?.[collectionName as any]?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    if (!q) {
      return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    try {
      const suggestResults = await typesenseClient
        .collections(collectionName)
        .documents()
        .search({
          q: q as string,
          query_by:
            pluginOptions.collections?.[collectionName]?.searchFields?.join(',') || 'title,content',
          per_page: Number(limit),
          highlight_full_fields:
            pluginOptions.collections?.[collectionName]?.searchFields?.join(',') || 'title,content',
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
