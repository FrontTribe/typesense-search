'use client'
import { useConfig } from '@payloadcms/ui'
import { useState } from 'react'

interface SearchResult {
  found: number
  hits: Array<{
    document: Record<string, unknown>
    highlight: Record<string, unknown>
  }>
  page: number
  search_time_ms: number
}

export const BeforeDashboardClient = () => {
  const { config } = useConfig()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<null | SearchResult>(null)
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

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`)
      }

      const results = await response.json()

      // Ensure results have the expected structure
      if (results && typeof results === 'object') {
        setSearchResults({
          found: results.found || 0,
          hits: results.hits || [],
          page: results.page || 1,
          search_time_ms: results.search_time_ms || 0,
        })
      } else {
        setSearchResults(null)
      }
    } catch (_error) {
      setSearchResults(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    void performSearch(searchQuery)
  }

  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        margin: '20px 0',
        padding: '20px',
      }}
    >
      <h2>
        <span aria-label="search" role="img">
          🔍
        </span>{' '}
        Typesense Search
      </h2>

      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select
            aria-label="Select collection to search"
            onChange={(e) => setSelectedCollection(e.target.value)}
            style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
            value={selectedCollection}
          >
            <option value="posts">Posts</option>
            <option value="media">Media</option>
          </select>

          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            style={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              flex: 1,
              padding: '8px',
            }}
            type="text"
            value={searchQuery}
          />

          <button
            disabled={isSearching}
            style={{
              backgroundColor: '#0070f3',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: isSearching ? 'not-allowed' : 'pointer',
              padding: '8px 16px',
            }}
            type="submit"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searchResults && (
        <div>
          <h3>
            Search Results ({searchResults.found || 0} found in {searchResults.search_time_ms || 0}
            ms)
          </h3>
          {searchResults.hits && searchResults.hits.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {searchResults.hits.map((hit, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    padding: '10px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {String(hit.document?.title) ||
                      String(hit.document?.filename) ||
                      `Document ${String(hit.document?.id) || index}`}
                  </div>
                  {hit.highlight && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: Object.values(hit.highlight).join(' ... '),
                      }}
                      style={{ color: '#666', fontSize: '14px' }}
                    />
                  )}
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
                    ID: {String(hit.document?.id) || 'Unknown'} | Updated:{' '}
                    {hit.document?.updatedAt
                      ? new Date(String(hit.document.updatedAt)).toLocaleDateString()
                      : 'Unknown'}
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
