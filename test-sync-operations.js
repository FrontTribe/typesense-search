// Test sync operations for create, update, and delete
const testSyncOperations = async () => {
  console.log('🔄 Testing Typesense Sync Operations...\n')

  try {
    // Test 1: Check current state
    console.log('1️⃣ Checking current Typesense state...')
    const currentResponse = await fetch('http://localhost:8108/collections/posts', {
      headers: { 'x-typesense-api-key': 'xyz' }
    })
    const currentData = await currentResponse.json()
    console.log(`   Current posts in Typesense: ${currentData.num_documents}`)

    // Test 2: Create a test post via API
    console.log('\n2️⃣ Creating a test post...')
    const createResponse = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-typesense-api-key': 'xyz'
      },
      body: JSON.stringify({
        title: 'Test Sync Post',
        content: 'This is a test post to verify sync functionality.',
        category: 'test',
        status: 'published'
      })
    })

    if (createResponse.ok) {
      const createdPost = await createResponse.json()
      console.log(`   ✅ Post created: ${createdPost.id}`)
      
      // Wait a moment for sync
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if it appeared in Typesense
      const afterCreateResponse = await fetch('http://localhost:8108/collections/posts', {
        headers: { 'x-typesense-api-key': 'xyz' }
      })
      const afterCreateData = await afterCreateResponse.json()
      console.log(`   Posts in Typesense after create: ${afterCreateData.num_documents}`)
      
      // Test 3: Update the post
      console.log('\n3️⃣ Updating the test post...')
      const updateResponse = await fetch(`http://localhost:3000/api/posts/${createdPost.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-typesense-api-key': 'xyz'
        },
        body: JSON.stringify({
          title: 'Updated Test Sync Post',
          content: 'This post has been updated to test sync functionality.',
          category: 'updated-test',
          status: 'published'
        })
      })

      if (updateResponse.ok) {
        console.log(`   ✅ Post updated: ${createdPost.id}`)
        
        // Wait for sync
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Search for the updated post in Typesense
        const searchResponse = await fetch('http://localhost:3000/api/search/posts?q=updated', {
          headers: { 'x-typesense-api-key': 'xyz' }
        })
        const searchData = await searchResponse.json()
        console.log(`   Search results for "updated": ${searchData.found} found`)
        
        if (searchData.found > 0) {
          console.log(`   ✅ Update sync working - found updated post`)
        } else {
          console.log(`   ❌ Update sync not working - updated post not found`)
        }
      } else {
        console.log(`   ❌ Failed to update post: ${updateResponse.status}`)
      }

      // Test 4: Delete the post
      console.log('\n4️⃣ Deleting the test post...')
      const deleteResponse = await fetch(`http://localhost:3000/api/posts/${createdPost.id}`, {
        method: 'DELETE',
        headers: { 'x-typesense-api-key': 'xyz' }
      })

      if (deleteResponse.ok) {
        console.log(`   ✅ Post deleted: ${createdPost.id}`)
        
        // Wait for sync
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check final state
        const finalResponse = await fetch('http://localhost:8108/collections/posts', {
          headers: { 'x-typesense-api-key': 'xyz' }
        })
        const finalData = await finalResponse.json()
        console.log(`   Posts in Typesense after delete: ${finalData.num_documents}`)
        
        if (finalData.num_documents === currentData.num_documents) {
          console.log(`   ✅ Delete sync working - count returned to original`)
        } else {
          console.log(`   ❌ Delete sync not working - count mismatch`)
        }
      } else {
        console.log(`   ❌ Failed to delete post: ${deleteResponse.status}`)
      }

    } else {
      console.log(`   ❌ Failed to create post: ${createResponse.status}`)
      const errorText = await createResponse.text()
      console.log(`   Error: ${errorText}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testSyncOperations()
