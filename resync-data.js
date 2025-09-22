// Script to resync data from Payload CMS to Typesense
import Typesense from 'typesense'

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: 'localhost',
      port: '8108',
      protocol: 'http',
    },
  ],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2,
})

const resyncData = async () => {
  console.log('🔄 Starting data resync from CMS to Typesense...\n')

  try {
    // Step 1: Clear existing Typesense collections
    console.log('1️⃣ Clearing existing Typesense collections...')

    try {
      await typesenseClient.collections('posts').delete()
      console.log('   ✅ Posts collection deleted')
    } catch (error) {
      console.log('   ℹ️  Posts collection not found (already empty)')
    }

    try {
      await typesenseClient.collections('media').delete()
      console.log('   ✅ Media collection deleted')
    } catch (error) {
      console.log('   ℹ️  Media collection not found (already empty)')
    }

    // Step 2: Recreate collections with proper schema
    console.log('\n2️⃣ Creating collections with proper schema...')

    // Posts collection
    await typesenseClient.collections().create({
      name: 'posts',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'category', type: 'string', facet: true },
        { name: 'status', type: 'string', facet: true },
        { name: 'createdAt', type: 'int64' },
        { name: 'updatedAt', type: 'int64' },
      ],
    })
    console.log('   ✅ Posts collection created')

    // Media collection
    await typesenseClient.collections().create({
      name: 'media',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'filename', type: 'string' },
        { name: 'alt', type: 'string' },
        { name: 'type', type: 'string', facet: true },
        { name: 'createdAt', type: 'int64' },
        { name: 'updatedAt', type: 'int64' },
      ],
    })
    console.log('   ✅ Media collection created')

    // Step 3: Fetch data from CMS and sync to Typesense
    console.log('\n3️⃣ Fetching data from CMS...')

    // Fetch posts from CMS
    const postsResponse = await fetch('http://localhost:3000/api/posts', {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!postsResponse.ok) {
      throw new Error(`Failed to fetch posts: ${postsResponse.status} ${postsResponse.statusText}`)
    }

    const postsData = await postsResponse.json()
    console.log(`   📝 Found ${postsData.docs?.length || 0} posts in CMS`)

    // Step 4: Sync posts to Typesense
    if (postsData.docs && postsData.docs.length > 0) {
      console.log('\n4️⃣ Syncing posts to Typesense...')

      for (const post of postsData.docs) {
        try {
          // Extract text from richText content
          let contentText = ''
          if (post.content && typeof post.content === 'object' && post.content.root) {
            contentText = extractTextFromRichText(post.content)
          } else if (typeof post.content === 'string') {
            contentText = post.content
          }

          const typesenseDoc = {
            id: String(post.id),
            title: post.title || '',
            content: contentText,
            category: post.category || 'unknown',
            status: post.status || 'draft',
            createdAt: new Date(post.createdAt).getTime(),
            updatedAt: new Date(post.updatedAt).getTime(),
          }

          await typesenseClient.collections('posts').documents().upsert(typesenseDoc)
          console.log(`   ✅ Synced post: "${post.title}"`)
        } catch (error) {
          console.error(`   ❌ Failed to sync post ${post.id}:`, error.message)
        }
      }
    }

    // Step 5: Verify sync
    console.log('\n5️⃣ Verifying sync...')

    const postsInTypesense = await typesenseClient.collections('posts').documents().search({
      q: '*',
      per_page: 10,
    })

    console.log(`   📊 Posts in Typesense: ${postsInTypesense.found}`)

    if (postsInTypesense.hits && postsInTypesense.hits.length > 0) {
      console.log('   📋 Sample posts:')
      postsInTypesense.hits.forEach((hit, index) => {
        console.log(`      ${index + 1}. ${hit.document.title}`)
      })
    }

    console.log('\n✅ Data resync completed successfully!')
    console.log('\n🧪 Test the search:')
    console.log(
      '   curl -s "http://localhost:3000/api/search/posts?q=*" -H "x-typesense-api-key: xyz" | jq \'{found: .found}\'',
    )
  } catch (error) {
    console.error('❌ Resync failed:', error.message)
    process.exit(1)
  }
}

// Helper function to extract text from richText structure
const extractTextFromRichText = (richText) => {
  if (!richText || !richText.root) {
    return ''
  }

  const extractText = (node) => {
    if (typeof node === 'string') {
      return node
    }

    if (node && typeof node === 'object') {
      if (node.text) {
        return node.text
      }

      if (node.children && Array.isArray(node.children)) {
        return node.children.map(extractText).join('')
      }
    }

    return ''
  }

  return extractText(richText.root)
}

// Run the resync
resyncData()
