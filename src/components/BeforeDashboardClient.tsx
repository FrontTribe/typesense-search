'use client'
import { useConfig } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

interface SearchResult {
  hits: Array<{
    document: any
    highlight: any
  }>
  found: number
  page: number
  search_time_ms: number
}

export const BeforeDashboardClient = () => {
  const { config } = useConfig()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState('posts')

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `${config.serverURL}${config.routes.api}/search/${selectedCollection}?q=${encodeURIComponent(query)}&per_page=5`,
      )
      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        margin: '20px 0',
      }}
    >
      <h2>🔍 Typesense Search</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="posts">Posts</option>
            <option value="media">Media</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />

          <button
            type="submit"
            disabled={isSearching}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSearching ? 'not-allowed' : 'pointer',
            }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searchResults && (
        <div>
          <h3>
            Search Results ({searchResults.found} found in {searchResults.search_time_ms}ms)
          </h3>
          {searchResults.hits.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {searchResults.hits.map((hit, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {hit.document.title || hit.document.filename || `Document ${hit.document.id}`}
                  </div>
                  {hit.highlight && (
                    <div
                      style={{ fontSize: '14px', color: '#666' }}
                      dangerouslySetInnerHTML={{
                        __html: Object.values(hit.highlight).join(' ... '),
                      }}
                    />
                  )}
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    ID: {hit.document.id} | Updated:{' '}
                    {new Date(hit.document.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No results found</p>
          )}
        </div>
      )}
    </div>
  )
}
