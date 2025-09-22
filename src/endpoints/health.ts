/**
 * Health check endpoint for monitoring plugin status
 */

import type { PayloadHandler } from 'payload'
import Typesense from 'typesense'
import type { TypesenseSearchConfig } from '../index.js'
import { searchCache } from '../lib/cache.js'
import type { HealthCheckResponse } from '../lib/types.js'

/**
 * Test Typesense connection
 */
const testTypesenseConnection = async (typesenseClient: Typesense.Client): Promise<boolean> => {
  try {
    const health = await typesenseClient.health.retrieve()
    return health.ok === true
  } catch (error) {
    console.error('Typesense health check failed:', error)
    return false
  }
}

/**
 * Get collection information
 */
const getCollectionInfo = async (typesenseClient: Typesense.Client): Promise<string[]> => {
  try {
    const collections = await typesenseClient.collections().retrieve()
    return collections.map(col => col.name)
  } catch (error) {
    console.error('Failed to retrieve collections:', error)
    return []
  }
}

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  const stats = searchCache.getStats()
  return {
    size: stats.size,
    maxSize: stats.maxSize,
    hitRate: stats.hitRate || 0
  }
}

/**
 * Create health check handler
 */
export const createHealthCheckHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
  lastSyncTime?: number
): PayloadHandler => {
  return async (): Promise<Response> => {
    try {
      const startTime = Date.now()
      
      // Test Typesense connection
      const isTypesenseHealthy = await testTypesenseConnection(typesenseClient)
      const typesenseInfo = isTypesenseHealthy 
        ? { ok: true, version: 'unknown' } // Typesense doesn't expose version in health check
        : { ok: false }
      
      // Get collection information
      const collections = isTypesenseHealthy ? await getCollectionInfo(typesenseClient) : []
      
      // Get cache statistics
      const cacheStats = getCacheStats()
      
      // Determine overall health status
      const isHealthy = isTypesenseHealthy && collections.length > 0
      
      const response: HealthCheckResponse = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        typesense: typesenseInfo,
        collections,
        lastSync: lastSyncTime,
        cache: cacheStats
      }
      
      // Add error details if unhealthy
      if (!isHealthy) {
        const errors = []
        if (!isTypesenseHealthy) {
          errors.push('Typesense connection failed')
        }
        if (collections.length === 0) {
          errors.push('No collections available')
        }
        response.error = errors.join(', ')
      }
      
      const responseTime = Date.now() - startTime
      
      return Response.json({
        ...response,
        responseTime,
        timestamp: new Date().toISOString(),
        version: '1.0.6' // Plugin version
      })
    } catch (error) {
      console.error('Health check failed:', error)
      
      const errorResponse: HealthCheckResponse = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        cache: getCacheStats()
      }
      
      return Response.json(errorResponse, { status: 500 })
    }
  }
}

/**
 * Create detailed health check handler with more information
 */
export const createDetailedHealthCheckHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
  lastSyncTime?: number
): PayloadHandler => {
  return async (): Promise<Response> => {
    try {
      const startTime = Date.now()
      
      // Test Typesense connection
      const isTypesenseHealthy = await testTypesenseConnection(typesenseClient)
      
      // Get detailed collection information
      let collections: any[] = []
      if (isTypesenseHealthy) {
        try {
          const collectionsData = await typesenseClient.collections().retrieve()
          collections = collectionsData.map(col => ({
            name: col.name,
            numDocuments: col.num_documents,
            fields: col.fields?.length || 0,
            createdAt: col.created_at
          }))
        } catch (error) {
          console.error('Failed to get detailed collection info:', error)
        }
      }
      
      // Get cache statistics
      const cacheStats = getCacheStats()
      
      // Get plugin configuration info
      const configInfo = {
        enabledCollections: Object.entries(pluginOptions.collections || {})
          .filter(([_, config]) => config?.enabled)
          .map(([name, config]) => ({
            name,
            displayName: config?.displayName,
            searchFields: config?.searchFields || [],
            facetFields: config?.facetFields || []
          })),
        totalCollections: Object.keys(pluginOptions.collections || {}).length,
        settings: pluginOptions.settings
      }
      
      // Determine overall health status
      const isHealthy = isTypesenseHealthy && collections.length > 0
      
      const response: any = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        typesense: {
          ok: isTypesenseHealthy,
          version: 'unknown'
        },
        collections: collections.map(col => col.name),
        collectionDetails: collections,
        config: configInfo,
        lastSync: lastSyncTime,
        cache: cacheStats,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: '1.0.6'
      }
      
      // Add error details if unhealthy
      if (!isHealthy) {
        const errors = []
        if (!isTypesenseHealthy) {
          errors.push('Typesense connection failed')
        }
        if (collections.length === 0) {
          errors.push('No collections available')
        }
        response.error = errors.join(', ')
      }
      
      return Response.json(response)
    } catch (error) {
      console.error('Detailed health check failed:', error)
      
      const errorResponse = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        cache: getCacheStats(),
        timestamp: new Date().toISOString(),
        version: '1.0.6'
      }
      
      return Response.json(errorResponse, { status: 500 })
    }
  }
}
