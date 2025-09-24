# Troubleshooting

Common issues and solutions for the Typesense Search Plugin.

## Common Issues

### Search Not Working

**Problem**: Search returns no results or errors.

**Possible Causes & Solutions**:

1. **Typesense not running**

   ```bash
   # Check if Typesense is running
   curl http://localhost:8108/health
   ```

   **Solution**: Start Typesense

   ```bash
   docker-compose up -d
   # or
   docker run -p 8108:8108 -v $(pwd)/typesense-data:/data typesense/typesense:0.25.2 --data-dir /data --api-key=xyz --enable-cors
   ```

2. **Wrong API key**

   ```typescript
   // Check your configuration
   typesense: {
     apiKey: 'xyz', // Must match Typesense startup
     nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }]
   }
   ```

3. **Collection not configured**

   ```typescript
   // Ensure collection is enabled
   collections: {
     posts: {
       enabled: true, // Must be true
       searchFields: ['title', 'content'] // Must have search fields
     }
   }
   ```

4. **No data synced**

   ```typescript
   // Check if data exists in Typesense
   const client = new TypesenseClient({
     nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
     apiKey: 'xyz',
   })

   const collections = await client.collections().retrieve()
   console.log('Collections:', collections)
   ```

### No Results Returned

**Problem**: Search queries return empty results.

**Solutions**:

1. **Check collection configuration**

   ```typescript
   // Verify collection is properly configured
   collections: {
     posts: {
       enabled: true,
       searchFields: ['title', 'content'], // These fields must exist
       facetFields: ['category', 'status']
     }
   }
   ```

2. **Verify data exists**

   ```typescript
   // Check if documents exist
   const searchResult = await client.collections('posts').documents().search({
     q: '*',
     per_page: 1,
   })
   console.log('Document count:', searchResult.found)
   ```

3. **Check search fields**

   ```typescript
   // Ensure search fields contain data
   const documents = await client.collections('posts').documents().retrieve()
   console.log('Sample document:', documents[0])
   ```

4. **Try different search terms**
   ```typescript
   // Test with simple queries
   const result = await client.collections('posts').documents().search({
     q: 'test', // Simple query
     per_page: 10,
   })
   ```

### Slow Search Performance

**Problem**: Search is slow or times out.

**Solutions**:

1. **Check Typesense performance**

   ```bash
   # Monitor Typesense metrics
   curl http://localhost:8108/metrics
   ```

2. **Optimize search parameters**

   ```typescript
   // Use search parameters in API calls
   const searchParams = {
     q: 'search query',
     per_page: 10, // Limit results
     num_typos: 1, // Reduce typos
     snippet_threshold: 30,
   }
   ```

3. **Check network latency**

   ```typescript
   // Test connection speed
   const start = Date.now()
   await client.health.retrieve()
   console.log('Connection time:', Date.now() - start, 'ms')
   ```

4. **Enable caching**
   ```typescript
   // Caching is enabled by default
   settings: {
     cache: {
       ttl: 300000, // 5 minutes in milliseconds
       maxSize: 1000
     }
   }
   ```

### CORS Errors

**Problem**: Browser CORS errors when searching.

**Solutions**:

1. **Enable CORS in Typesense**

   ```bash
   # Start Typesense with CORS enabled
   docker run -p 8108:8108 \
     -v $(pwd)/typesense-data:/data \
     typesense/typesense:0.25.2 \
     --data-dir /data \
     --api-key=xyz \
     --enable-cors
   ```

2. **Check API endpoint accessibility**

   ```bash
   # Test API endpoint
   curl -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: X-Requested-With" \
        -X OPTIONS \
        http://localhost:3000/api/search
   ```

3. **Verify baseUrl configuration**
   ```typescript
   <UnifiedSearchInput
     baseUrl="http://localhost:3000" // Must match your domain
   />
   ```

### TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solutions**:

1. **Install types**

   ```bash
   pnpm add -D @types/node @types/react
   ```

2. **Check import paths**

   ```typescript
   // Correct import
   import { UnifiedSearchInput } from 'typesense-search-plugin'

   // Not
   import { UnifiedSearchInput } from 'typesense-search-plugin/dist'
   ```

3. **Update TypeScript configuration**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

## Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// Enable debug mode
const debugSearch = async () => {
  console.log('🔍 Debug: Starting search...')

  try {
    // Test Typesense connection
    const health = await client.health.retrieve()
    console.log('✅ Typesense health:', health)

    // Test collections
    const collections = await client.collections().retrieve()
    console.log('📚 Collections:', collections)

    // Test search
    const result = await client.collections('posts').documents().search({
      q: 'test',
      per_page: 1,
    })
    console.log('🔍 Search result:', result)
  } catch (error) {
    console.error('❌ Search error:', error)
  }
}
```

## Environment-Specific Issues

### Development

**Common issues**:

- Typesense not running
- Wrong API keys
- CORS issues
- Missing environment variables

**Solutions**:

```bash
# Check environment
echo $TYPESENSE_API_KEY
echo $TYPESENSE_NODES

# Start services
docker-compose up -d
pnpm dev
```

### Production

**Common issues**:

- Network connectivity
- SSL/TLS issues
- Performance problems
- Memory issues

**Solutions**:

```typescript
// Production configuration
typesense: {
  apiKey: process.env.TYPESENSE_API_KEY,
  nodes: JSON.parse(process.env.TYPESENSE_NODES),
  connectionTimeoutSeconds: 10,
  numRetries: 5
}
```

## Performance Issues

### Memory Usage

**Problem**: High memory usage.

**Solutions**:

1. Limit result sets
2. Enable pagination
3. Use virtual scrolling
4. Implement result caching

### Slow Queries

**Problem**: Queries take too long.

**Solutions**:

1. Optimize search fields
2. Reduce typo tolerance
3. Limit facets
4. Use field boosting

## Getting Help

### Before Asking for Help

1. **Check the logs**

   ```bash
   # Check Payload logs
   tail -f logs/payload.log

   # Check Typesense logs
   docker logs typesense-container
   ```

2. **Test with minimal configuration**

   ```typescript
   // Minimal working example
   typesenseSearch({
     typesense: {
       apiKey: 'xyz',
       nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
     },
     collections: {
       posts: {
         enabled: true,
         searchFields: ['title'],
       },
     },
   })
   ```

3. **Check versions**
   ```bash
   # Check package versions
   pnpm list typesense-search-plugin
   pnpm list typesense
   pnpm list payload
   ```

### Reporting Issues

When reporting issues, include:

1. **Environment details**
   - Node.js version
   - Package versions
   - Operating system

2. **Configuration**
   - Your Payload config
   - Typesense configuration
   - Error messages

3. **Steps to reproduce**
   - What you did
   - What you expected
   - What actually happened

4. **Logs and errors**
   - Console output
   - Network requests
   - Stack traces

### Community Support

- [GitHub Issues](https://github.com/fronttribe/typesense-search/issues)
- [GitHub Discussions](https://github.com/fronttribe/typesense-search/discussions)
- [NPM Package](https://www.npmjs.com/package/typesense-search-plugin)

## Quick Fixes

### Reset Everything

```bash
# Stop all services
docker-compose down

# Clear Typesense data
rm -rf typesense-data

# Restart everything
docker-compose up -d
pnpm dev
```

### Update Configuration

```typescript
// Reset to default configuration
typesenseSearch({
  typesense: {
    apiKey: 'xyz',
    nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
  },
  collections: {
    // Add your collections here
  },
})
```

### Clear Cache

```bash
# Clear npm cache
pnpm store prune

# Clear build cache
rm -rf .next
rm -rf dist

# Reinstall dependencies
rm -rf node_modules
pnpm install
```
