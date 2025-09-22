/**
 * Configuration validation using Zod schemas
 */

import { z } from 'zod'

// Typesense node configuration schema
const TypesenseNodeSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535, 'Port must be between 1 and 65535'),
  protocol: z.enum(['http', 'https'])
})

// Collection configuration schema
const CollectionConfigSchema = z.object({
  enabled: z.boolean().optional().default(true),
  displayName: z.string().optional(),
  icon: z.string().optional(),
  searchFields: z.array(z.string()).min(1, 'At least one search field is required'),
  facetFields: z.array(z.string()).optional().default([]),
  fieldMapping: z.record(z.string(), z.string()).optional()
})

// Cache configuration schema
const CacheConfigSchema = z.object({
  ttl: z.number().int().min(1000, 'TTL must be at least 1000ms').optional().default(300000), // 5 minutes
  maxSize: z.number().int().min(1, 'Max size must be at least 1').optional().default(1000)
})

// Settings configuration schema
const SettingsConfigSchema = z.object({
  categorized: z.boolean().optional().default(false),
  cache: CacheConfigSchema.optional()
})

// Main plugin configuration schema
export const TypesenseSearchConfigSchema = z.object({
  typesense: z.object({
    nodes: z.array(TypesenseNodeSchema).min(1, 'At least one Typesense node is required'),
    apiKey: z.string().min(1, 'API key is required'),
    connectionTimeoutSeconds: z.number().int().min(1).optional().default(10),
    numRetries: z.number().int().min(0).optional().default(3),
    retryIntervalSeconds: z.number().int().min(1).optional().default(1)
  }),
  collections: z.record(z.string(), CollectionConfigSchema),
  settings: SettingsConfigSchema.optional()
})

// Type inference from schema
export type ValidatedTypesenseSearchConfig = z.infer<typeof TypesenseSearchConfigSchema>

// Validation result type
export interface ValidationResult {
  success: boolean
  data?: ValidatedTypesenseSearchConfig
  errors?: string[]
}

/**
 * Validate plugin configuration
 */
export function validateConfig(config: unknown): ValidationResult {
  try {
    const validatedConfig = TypesenseSearchConfigSchema.parse(config)
    return {
      success: true,
      data: validatedConfig
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: any) => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
        return `${path}${err.message}`
      })
      
      return {
        success: false,
        errors
      }
    }
    
    return {
      success: false,
      errors: ['Invalid configuration format']
    }
  }
}

/**
 * Validate and transform configuration with defaults
 */
export function validateAndTransformConfig(config: unknown): ValidationResult {
  try {
    const validatedConfig = TypesenseSearchConfigSchema.parse(config)
    return {
      success: true,
      data: validatedConfig
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: any) => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
        return `${path}${err.message}`
      })
      
      return {
        success: false,
        errors
      }
    }
    
    return {
      success: false,
      errors: ['Invalid configuration format']
    }
  }
}

/**
 * Validate individual collection configuration
 */
export function validateCollectionConfig(collectionSlug: string, config: unknown): ValidationResult {
  try {
    const validatedConfig = CollectionConfigSchema.parse(config)
    return {
      success: true,
      data: { [collectionSlug]: validatedConfig } as any
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: any) => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
        return `Collection '${collectionSlug}' - ${path}${err.message}`
      })
      
      return {
        success: false,
        errors
      }
    }
    
    return {
      success: false,
      errors: [`Collection '${collectionSlug}': Invalid configuration format`]
    }
  }
}

/**
 * Get configuration validation errors in a user-friendly format
 */
export function getValidationErrors(errors: string[]): string {
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n')
}

/**
 * Validate search parameters
 */
export const SearchParamsSchema = z.object({
  q: z.string().min(1, 'Query parameter "q" is required'),
  page: z.number().int().min(1).optional().default(1),
  per_page: z.number().int().min(1).max(250).optional().default(10),
  sort_by: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  facets: z.array(z.string()).optional(),
  highlight_fields: z.array(z.string()).optional(),
  snippet_threshold: z.number().int().min(0).max(100).optional().default(30),
  num_typos: z.number().int().min(0).max(4).optional().default(0),
  typo_tokens_threshold: z.number().int().min(1).optional().default(1)
})

export type ValidatedSearchParams = z.infer<typeof SearchParamsSchema>

/**
 * Validate search parameters
 */
export function validateSearchParams(params: unknown): ValidationResult {
  try {
    const validatedParams = SearchParamsSchema.parse(params)
    return {
      success: true,
      data: validatedParams as any
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: any) => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
        return `${path}${err.message}`
      })
      
      return {
        success: false,
        errors
      }
    }
    
    return {
      success: false,
      errors: ['Invalid search parameters format']
    }
  }
}
