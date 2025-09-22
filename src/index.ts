import type { CollectionSlug, Config } from 'payload'
import Typesense from 'typesense'

import { customEndpointHandler } from './endpoints/customEndpointHandler.js'
import { createSearchEndpoints } from './endpoints/search.js'
import { createTypesenseClient } from './lib/typesense-client.js'
import { setupHooks } from './lib/hooks.js'
import { initializeTypesenseCollections } from './lib/initialization.js'

export type TypesenseSearchConfig = {
  /**
   * Typesense server configuration
   */
  typesense: {
    nodes: Array<{
      host: string
      port: string | number
      protocol: 'http' | 'https'
    }>
    apiKey: string
    connectionTimeoutSeconds?: number
  }

  /**
   * Collections to index in Typesense
   */
  collections?: Partial<
    Record<
      CollectionSlug,
      {
        enabled: boolean
        searchFields?: string[]
        facetFields?: string[]
        sortFields?: string[]
      }
    >
  >

  /**
   * Global plugin settings
   */
  settings?: {
    autoSync?: boolean
    batchSize?: number
    searchEndpoint?: string
  }

  disabled?: boolean
}

export const typesenseSearch =
  (pluginOptions: TypesenseSearchConfig) =>
  (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    // Initialize Typesense client
    const typesenseClient = createTypesenseClient(pluginOptions.typesense)

    // Add search endpoints
    config.endpoints = [
      ...(config.endpoints || []),
      ...createSearchEndpoints(typesenseClient, pluginOptions),
    ]

    // Add admin components
    config.admin = {
      ...config.admin,
      components: {
        ...config.admin?.components,
        beforeDashboard: [
          ...(config.admin?.components?.beforeDashboard || []),
          `typesense-search/client#BeforeDashboardClient`,
          `typesense-search/rsc#BeforeDashboardServer`,
        ],
      },
    }

    // Setup collection hooks for auto-sync
    if (pluginOptions.settings?.autoSync !== false) {
      config.hooks = setupHooks(typesenseClient, pluginOptions, config.hooks)
    }

    // Initialize collections in Typesense
    const incomingOnInit = config.onInit
    config.onInit = async (payload) => {
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      await initializeTypesenseCollections(payload, typesenseClient, pluginOptions)
    }

    return config
  }
