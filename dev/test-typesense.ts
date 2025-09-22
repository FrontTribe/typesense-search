import Typesense from 'typesense'

const client = new Typesense.Client({
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2,
})

async function testTypesense() {
  try {
    console.log('🔍 Testing Typesense connection...')

    // Test connection
    const health = await client.health.retrieve()
    console.log('✅ Typesense is healthy:', health)

    // Create a test collection
    const collection = await client.collections().create({
      name: 'test-posts',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
      ],
    })
    console.log('✅ Collection created:', collection.name)

    // Add a test document
    const document = await client.collections('test-posts').documents().create({
      id: '1',
      title: 'Test Post',
      content: 'This is a test post for Typesense integration',
    })
    console.log('✅ Document created:', document.id)

    // Search
    const searchResults = await client.collections('test-posts').documents().search({
      q: 'test',
      query_by: 'title,content',
    })
    console.log('✅ Search results:', searchResults.hits.length, 'documents found')

    // Clean up
    await client.collections('test-posts').delete()
    console.log('✅ Test collection cleaned up')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testTypesense()
