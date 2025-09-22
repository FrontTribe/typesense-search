# Create Test Post with "Cursor" Content

Since the API requires authentication, please create a post manually through the admin panel:

## 🎯 **Steps to Create Test Post**

1. **Go to Admin Panel**: http://localhost:3000/admin
2. **Login** with credentials:
   - Email: `dev@payloadcms.com`
   - Password: `test`
3. **Navigate to Posts**: Click "Posts" in the left sidebar
4. **Create New Post**: Click "Create New" button
5. **Fill in the form**:
   - **Title**: `Test Post with Cursor`
   - **Content**: `This post contains the word cursor in its content for testing search functionality.`
   - **Category**: `test`
   - **Status**: `published`
6. **Save** the post

## 🔍 **Test the Search**

After creating the post, test the search:

```bash
# Search for "cursor"
curl -s "http://localhost:3000/api/search/posts?q=cursor" -H "x-typesense-api-key: xyz" | jq '{found: .found, hits: [.hits[0].document.title]}'

# Search for "test"
curl -s "http://localhost:3000/api/search/posts?q=test" -H "x-typesense-api-key: xyz" | jq '{found: .found, hits: [.hits[0].document.title]}'
```

## 🧪 **Expected Results**

- Search for "cursor" should return 1 result
- Search for "test" should return 1 result
- The post should be automatically synced to Typesense
- Content should be properly extracted from richText field

## 🔧 **If Sync Doesn't Work**

If the post doesn't appear in search results, the sync hooks might not be working. In that case:

1. Check the server logs for sync messages
2. Verify the post was created in the CMS
3. Check if the post appears in Typesense directly
4. Restart the development server to ensure hooks are loaded
