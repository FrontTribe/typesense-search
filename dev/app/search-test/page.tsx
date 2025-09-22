'use client'

import React, { useState, useCallback } from 'react'
import HeadlessSearchInput from '../../../src/components/HeadlessSearchInput'
import type { SearchHit } from '../../../src/components/HeadlessSearchInput'

const SearchTestPage = () => {
  const [selectedResult, setSelectedResult] = useState<SearchHit['document'] | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchStats, setSearchStats] = useState<{
    totalSearches: number
    lastSearchTime: number
    averageResults: number
  }>({
    totalSearches: 0,
    lastSearchTime: 0,
    averageResults: 0,
  })

  const handleResultClick = useCallback((result: SearchHit) => {
    setSelectedResult(result.document)
    console.log('Selected result:', result.document)
  }, [])

  const handleSearch = useCallback((query: string) => {
    console.log('Search performed:', query)
    setSearchHistory((prev) => [query, ...prev.filter((q) => q !== query)].slice(0, 10))
    setSearchStats((prev) => ({
      ...prev,
      totalSearches: prev.totalSearches + 1,
    }))
  }, [])

  const handleResults = useCallback((results: any) => {
    if (results) {
      setSearchStats((prev) => ({
        ...prev,
        lastSearchTime: results.search_time_ms || 0,
        averageResults: Math.round(
          (prev.averageResults * (prev.totalSearches - 1) + results.found) / prev.totalSearches,
        ),
      }))
    }
  }, [])

  const customRenderResult = useCallback(
    (hit: SearchHit, index: number) => {
      const result = hit.document
      const highlight = Object.values(hit.highlight || {}).join(' ... ')

      return (
        <div
          key={result.id || index}
          style={{
            padding: '16px',
            borderBottom: '1px solid #e1e5e9',
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease',
            borderRadius: '8px',
            marginBottom: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
          }}
          onClick={() => handleResultClick(hit)}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                lineHeight: '1.4',
              }}
            >
              {result.title || `Document ${result.id}`}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {result.status && (
                <span
                  style={{
                    fontSize: '12px',
                    color: result.status === 'published' ? '#059669' : '#d97706',
                    backgroundColor: result.status === 'published' ? '#d1fae5' : '#fef3c7',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '500',
                  }}
                >
                  {result.status}
                </span>
              )}
              {result.category && (
                <span
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '500',
                  }}
                >
                  {result.category}
                </span>
              )}
            </div>
          </div>

          {highlight && (
            <div
              style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '8px',
                lineHeight: '1.5',
                backgroundColor: '#f8fafc',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
              dangerouslySetInnerHTML={{ __html: highlight }}
            />
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#9ca3af',
            }}
          >
            <span>ID: {result.id}</span>
            <span>Updated: {new Date(result.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      )
    },
    [handleResultClick],
  )

  const customRenderNoResults = useCallback(
    (query: string) => (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: '#6b7280',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #e1e5e9',
          margin: '16px 0',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
          No results found for "{query}"
        </div>
        <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
          Try different keywords or check your spelling. You can search by title, content, or
          category.
        </p>
      </div>
    ),
    [],
  )

  const customRenderLoading = useCallback(
    () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: '#6b7280',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          margin: '16px 0',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            border: '3px solid #e1e5e9',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '12px',
          }}
        />
        <span style={{ fontSize: '16px', fontWeight: '500' }}>Searching...</span>
      </div>
    ),
    [],
  )

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Typesense Search Test Page
        </h1>
        <p
          style={{
            fontSize: '1.1rem',
            color: '#6b7280',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px auto',
            lineHeight: '1.6',
          }}
        >
          Test the headless search component with your Payload CMS posts. Search by title, content,
          or category to see real-time results.
        </p>
      </div>

      {/* Search Stats */}
      {searchStats.totalSearches > 0 && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '32px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>
            Search Statistics
          </h3>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6b7280' }}>
            <span>
              Total searches: <strong>{searchStats.totalSearches}</strong>
            </span>
            <span>
              Last search time: <strong>{searchStats.lastSearchTime}ms</strong>
            </span>
            <span>
              Average results: <strong>{searchStats.averageResults}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Search Components */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '40px',
        }}
      >
        {/* Posts Search */}
        <div
          style={{
            padding: '24px',
            border: '1px solid #e1e5e9',
            borderRadius: '12px',
            backgroundColor: '#fafbfc',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px 0',
              color: '#374151',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📝 Posts Search
          </h2>
          <HeadlessSearchInput
            baseUrl="http://localhost:3000"
            collection="posts"
            placeholder="Search posts by title, content, or category..."
            debounceMs={300}
            minQueryLength={2}
            perPage={5}
            showLoading={true}
            showSearchTime={true}
            showResultCount={true}
            onResultClick={handleResultClick}
            onSearch={handleSearch}
            onResults={handleResults}
            renderResult={customRenderResult}
            renderNoResults={customRenderNoResults}
            renderLoading={customRenderLoading}
            resultsClassName="posts-search-results"
          />
        </div>

        {/* Media Search */}
        <div
          style={{
            padding: '24px',
            border: '1px solid #e1e5e9',
            borderRadius: '12px',
            backgroundColor: '#fafbfc',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px 0',
              color: '#374151',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🖼️ Media Search
          </h2>
          <HeadlessSearchInput
            baseUrl="http://localhost:3000"
            collection="media"
            placeholder="Search media by filename or description..."
            debounceMs={300}
            minQueryLength={2}
            perPage={5}
            showLoading={true}
            showSearchTime={true}
            showResultCount={true}
            onResultClick={(result) => {
              console.log('Media selected:', result.document)
              setSelectedResult(result.document)
            }}
            onSearch={(query) => console.log('Media search:', query)}
            renderResult={(hit, index) => {
              const result = hit.document
              return (
                <div
                  key={result.id || index}
                  style={{
                    padding: '12px',
                    border: '1px solid #e1e5e9',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  onClick={() => handleResultClick(hit)}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{result.filename}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{result.alt}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    Type: {result.type}
                  </div>
                </div>
              )
            }}
          />
        </div>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '16px', color: '#374151' }}>Recent Searches</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {searchHistory.map((query, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid #c7d2fe',
                }}
                onClick={() => console.log('Search again:', query)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c7d2fe'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e0e7ff'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {query}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Selected Result Display */}
      {selectedResult && (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            marginBottom: '40px',
          }}
        >
          <h2
            style={{
              marginBottom: '16px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📄 Selected Result
          </h2>
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', color: '#1f2937', fontSize: '20px' }}>
              {selectedResult.title || selectedResult.filename || `Document ${selectedResult.id}`}
            </h3>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '12px',
                fontSize: '14px',
                color: '#6b7280',
              }}
            >
              {selectedResult.status && (
                <span>
                  Status: <strong>{selectedResult.status}</strong>
                </span>
              )}
              {selectedResult.category && (
                <span>
                  Category: <strong>{selectedResult.category}</strong>
                </span>
              )}
              {selectedResult.type && (
                <span>
                  Type: <strong>{selectedResult.type}</strong>
                </span>
              )}
              <span>
                Updated: <strong>{new Date(selectedResult.updatedAt).toLocaleDateString()}</strong>
              </span>
            </div>
            {selectedResult.content && (
              <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6' }}>
                {selectedResult.content}
              </p>
            )}
            {selectedResult.alt && (
              <p style={{ margin: '12px 0 0 0', color: '#4b5563', lineHeight: '1.6' }}>
                <strong>Description:</strong> {selectedResult.alt}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Integration Code Example */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          color: '#f9fafb',
          marginBottom: '40px',
        }}
      >
        <h2 style={{ marginBottom: '16px', color: '#f9fafb' }}>Integration Code</h2>
        <pre
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.5',
            overflow: 'auto',
            backgroundColor: '#111827',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #374151',
          }}
        >
          {`import HeadlessSearchInput from 'typesense-search'

function MySearchPage() {
  const handleResultClick = (result) => {
    console.log('Result clicked:', result)
    // Navigate to result page or show details
  }

  return (
    <div>
      <h1>Search Our Content</h1>
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        placeholder="Search posts..."
        onResultClick={handleResultClick}
      />
    </div>
  )
}`}
        </pre>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .posts-search-results {
          max-height: 400px;
          overflow-y: auto;
        }

        .posts-search-results::-webkit-scrollbar {
          width: 6px;
        }

        .posts-search-results::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .posts-search-results::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .posts-search-results::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  )
}

export default SearchTestPage
