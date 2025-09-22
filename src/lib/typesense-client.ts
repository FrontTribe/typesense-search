import Typesense from 'typesense'
import type { TypesenseSearchConfig } from '../index.js'

export const createTypesenseClient = (typesenseConfig: TypesenseSearchConfig['typesense']) => {
  return new Typesense.Client({
    nodes: typesenseConfig.nodes,
    apiKey: typesenseConfig.apiKey,
    connectionTimeoutSeconds: typesenseConfig.connectionTimeoutSeconds || 2,
  })
}

export const testTypesenseConnection = async (client: Typesense.Client): Promise<boolean> => {
  try {
    await client.health.retrieve()
    return true
  } catch (error) {
    console.error('Typesense connection failed:', error)
    return false
  }
}
