import type { PayloadHandler, PayloadRequest } from 'payload'
import type Typesense from 'typesense'

import type { TypesenseSearchConfig } from '../index.js'

import { searchCache } from '../lib/cache.js'
import { getValidationErrors, validateSearchParams } from '../lib/config-validation.js'
import { createDetailedHealthCheckHandler, createHealthCheckHandler } from './health.js'

// Universal search across all collections
const searchAllCollections = async (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
  query: string,
  options: { filters: Record<string, unknown>; page: number; per_page: number; sort_by?: string },
) => {
  try {
    // Universal search logic

    // Check cache first
    const _cacheKey = `universal:${query}:${options.page}:${options.per_page}`
    const cachedResult = searchCache.get(query, 'universal', options)
    if (cachedResult) {
      // Return cached result
      return Response.json(cachedResult)
    }

    const enabledCollections = Object.entries(pluginOptions.collections || {}).filter(
      ([_, config]) => config?.enabled,
    )

    // Process enabled collections

    if (enabledCollections.length === 0) {
      return Response.json({ error: 'No collections enabled for search' }, { status: 400 })
    }

    // Search all collections in parallel
    const searchPromises = enabledCollections.map(async ([collectionName, config]) => {
      try {
        const searchParameters: Record<string, unknown> = {
          highlight_full_fields: config?.searchFields?.join(',') || 'title,content',
          num_typos: 0,
          page: options.page,
          per_page: Math.ceil(options.per_page / enabledCollections.length), // Distribute results across collections
          q: query,
          query_by: config?.searchFields?.join(',') || 'title,content',
          snippet_threshold: 30,
          typo_tokens_threshold: 1,
        }

        // Search collection

        const results = await typesenseClient
          .collections(collectionName)
          .documents()
          .search(searchParameters)

        // Process results

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
      } catch (_error) {
        // Handle search error
        return {
          collection: collectionName,
          displayName: config?.displayName || collectionName,
          error: _error instanceof Error ? _error.message : 'Unknown error',
          found: 0,
          hits: [],
          icon: config?.icon || '📄',
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
      collections: results.map((r) => ({
        collection: r.collection,
        displayName: r.displayName,
        error: r.error,
        found: r.found || 0,
        icon: r.icon,
      })),
      found: totalFound,
      hits: combinedHits.slice(0, options.per_page),
      page: options.page,
      request_params: { per_page: options.per_page, q: query },
      search_cutoff: false,
      search_time_ms: 0,
    }

    // Cache the result
    searchCache.set(query, searchResult, 'universal', options)

    return Response.json(searchResult)
  } catch (error) {
    // Handle universal search error
    return Response.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Universal search failed',
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
      handler: createCollectionsHandler(pluginOptions),
      method: 'get' as const,
      path: '/search/collections',
    },
    {
      handler: createSuggestHandler(typesenseClient, pluginOptions),
      method: 'get' as const,
      path: '/search/:collectionName/suggest',
    },
    {
      handler: createSearchHandler(typesenseClient, pluginOptions),
      method: 'get' as const,
      path: '/search/:collectionName',
    },
    {
      handler: createAdvancedSearchHandler(typesenseClient, pluginOptions),
      method: 'post' as const,
      path: '/search/:collectionName',
    },
    {
      handler: createSearchHandler(typesenseClient, pluginOptions),
      method: 'get' as const,
      path: '/search',
    },
    {
      handler: createHealthCheckHandler(typesenseClient, pluginOptions, lastSyncTime),
      method: 'get' as const,
      path: '/search/health',
    },
    {
      handler: createDetailedHealthCheckHandler(typesenseClient, pluginOptions, lastSyncTime),
      method: 'get' as const,
      path: '/search/health/detailed',
    },
  ]
}

const createSearchHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
): PayloadHandler => {
  return async ({ query, routeParams, url }: PayloadRequest) => {
    try {
      // Extract collection name from URL path (fallback to routeParams if available)
      let collectionName: string
      let collectionNameStr: string

      if (url && typeof url === 'string') {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/')
        const searchIndex = pathParts.indexOf('search')
        if (searchIndex !== -1 && pathParts[searchIndex + 1]) {
          collectionName = pathParts[searchIndex + 1] || ''
          collectionNameStr = String(collectionName)
        } else {
          collectionName = ''
          collectionNameStr = ''
        }
      } else {
        // Fallback to routeParams extraction
        const { collectionName: paramCollectionName } = (routeParams as Record<string, unknown>) || {}
        collectionName = String(paramCollectionName || '')
        collectionNameStr = collectionName
      }

      // Extract search parameters
      const q = String(query?.q || '')
      const pageParam = query?.page
      const perPageParam = query?.per_page
      const page = pageParam ? parseInt(String(pageParam), 10) : 1
      const per_page = perPageParam ? parseInt(String(perPageParam), 10) : 10
      const sort_by = query?.sort_by

      // Validate parsed numbers
      if (isNaN(page) || page < 1) {
        return Response.json({ error: 'Invalid page parameter' }, { status: 400 })
      }
      if (isNaN(per_page) || per_page < 1 || per_page > 250) {
        return Response.json({ error: 'Invalid per_page parameter' }, { status: 400 })
      }

      // Process search request

      // Validate search parameters
      const searchParams = { page, per_page, q, sort_by: sort_by as string | undefined }
      const validation = validateSearchParams(searchParams)
      if (!validation.success) {
        return Response.json(
          {
            details: getValidationErrors(validation.errors || []),
            error: 'Invalid search parameters',
          },
          { status: 400 },
        )
      }

      // If no collection specified, search across all enabled collections
      if (!collectionName) {
        if (!q || q.trim() === '') {
          return Response.json(
            {
              details: 'Please provide a search query using ?q=your_search_term',
              error: 'Query parameter "q" is required',
              example: '/api/search?q=example',
            },
            { status: 400 },
          )
        }

        const searchOptions: {
          filters: Record<string, unknown>
          page: number
          per_page: number
          sort_by?: string
        } = {
          filters: {},
          page,
          per_page,
        }
        if (sort_by && typeof sort_by === 'string') {
          searchOptions.sort_by = sort_by
        }
        return await searchAllCollections(typesenseClient, pluginOptions, q, searchOptions)
      }

      // Validate collection is enabled
      if (!pluginOptions.collections?.[collectionNameStr]?.enabled) {
        return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
      }

      if (!q) {
        return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
      }

      const searchParameters: any = {
        highlight_full_fields:
          pluginOptions.collections?.[collectionNameStr]?.searchFields?.join(',') ||
          'title,content',
        num_typos: 0,
        page: Number(page),
        per_page: Number(per_page),
        q: String(q),
        query_by:
          pluginOptions.collections?.[collectionNameStr]?.searchFields?.join(',') ||
          'title,content',
        snippet_threshold: 30,
        typo_tokens_threshold: 1,
      }

      // Add sorting
      if (sort_by && typeof sort_by === 'string') {
        searchParameters.sort_by = sort_by
      }

      // Execute Typesense search

      // Check cache first
      const cacheOptions = { collection: collectionName, page, per_page, sort_by }
      const cachedResult = searchCache.get(q, collectionNameStr, cacheOptions)
      if (cachedResult) {
        // Return cached result
        return Response.json(cachedResult)
      }

      // Check if collection exists in Typesense
      try {
        await typesenseClient.collections(collectionNameStr).retrieve()
      } catch (collectionError: any) {
        if (collectionError?.httpStatus === 404) {
          return Response.json(
            {
              details: `The collection "${collectionNameStr}" does not exist in Typesense. Please ensure the server has been restarted to initialize collections.`,
              error: 'Collection not found in Typesense',
              hint: 'Collections are created automatically when Payload initializes. Try restarting your server.',
            },
            { status: 404 },
          )
        }
        throw collectionError
      }

      const searchResults = await typesenseClient
        .collections(collectionNameStr)
        .documents()
        .search(searchParameters)

      // Process search results

      // Cache the result
      searchCache.set(q, searchResults, collectionNameStr, cacheOptions)

      return Response.json(searchResults)
    } catch (_error) {
      // Handle search error
      const errorMessage = _error instanceof Error ? _error.message : 'Unknown error'
      const errorDetails: any = {
        details: errorMessage,
        error: 'Search handler failed',
      }

      // Add more context for Typesense errors
      if (_error && typeof _error === 'object' && 'httpStatus' in _error) {
        errorDetails.httpStatus = (_error as any).httpStatus
        if ((_error as any).httpStatus === 404) {
          errorDetails.message = 'Collection not found in Typesense'
        }
      }

      return Response.json(errorDetails, { status: 500 })
    }
  }
}

const createAdvancedSearchHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
): PayloadHandler => {
  return async ({ routeParams, ...req }: PayloadRequest) => {
    const { collectionName } = (routeParams as Record<string, unknown>) || {}
    const collectionNameStr = String(collectionName || '')
    const body = req.data || (await (req as Request).json?.().catch(() => ({}))) || {}

    if (!pluginOptions.collections?.[collectionNameStr]?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    try {
      const searchResults = await typesenseClient
        .collections(collectionNameStr)
        .documents()
        .search(body)

      return Response.json(searchResults)
    } catch (_error) {
      // Handle advanced search error
      return Response.json({ error: 'Advanced search failed' }, { status: 500 })
    }
  }
}

const createSuggestHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
): PayloadHandler => {
  return async ({ url }: PayloadRequest) => {
    // Extract collection name from URL path
    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'Invalid request URL' }, { status: 400 })
    }
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const collectionName = pathParts[pathParts.indexOf('search') + 1]
    const collectionNameStr = String(collectionName || '')

    // Extract query parameters
    const q = urlObj.searchParams.get('q')
    const limit = urlObj.searchParams.get('limit') || '5'

    if (!collectionName || !pluginOptions.collections?.[collectionNameStr]?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    if (!q) {
      return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    try {
      const suggestResults = await typesenseClient
        .collections(collectionNameStr)
        .documents()
        .search({
          highlight_full_fields:
            pluginOptions.collections?.[collectionNameStr]?.searchFields?.join(',') ||
            'title,content',
          per_page: Number(limit),
          q,
          query_by:
            pluginOptions.collections?.[collectionNameStr]?.searchFields?.join(',') ||
            'title,content',
          snippet_threshold: 30,
        })

      return Response.json(suggestResults)
    } catch (_error) {
      // Handle suggest error
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
          facetFields: config?.facetFields || [],
          icon: config?.icon || '📄',
          searchFields: config?.searchFields || [],
        }))

      return Response.json({
        categorized: pluginOptions.settings?.categorized || false,
        collections,
      })
    } catch (_error) {
      // Handle collections error
      return Response.json({ error: 'Failed to get collections' }, { status: 500 })
    }
  }
}
