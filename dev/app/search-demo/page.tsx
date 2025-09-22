'use client'

import React, { useState, useCallback } from 'react'
import UnifiedSearchInput from '../../../src/components/UnifiedSearchInput'
import type { SearchHit } from '../../../src/components/HeadlessSearchInput'

const SearchDemoPage = () => {
  const [selectedResult, setSelectedResult] = useState<SearchHit['document'] | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    totalResults: 0,
    averageResults: 0,
  })
  const [searchError, setSearchError] = useState<string | null>(null)

  const handleResultClick = useCallback((result: SearchHit) => {
    console.log('Result selected:', result.document)
    setSelectedResult(result.document)
  }, [])

  const handleSearch = useCallback((query: string) => {
    console.log('Search performed:', query)
    setSearchHistory((prev) => [query, ...prev.slice(0, 9)]) // Keep last 10 searches
  }, [])

  const handleResults = useCallback((results: any) => {
    console.log('Search results:', results)
    setSearchError(null) // Clear any previous errors
    setSearchStats((prev) => ({
      totalSearches: prev.totalSearches + 1,
      totalResults: prev.totalResults + results.found,
      averageResults: Math.round((prev.totalResults + results.found) / (prev.totalSearches + 1)),
    }))
  }, [])

  const handleSearchError = useCallback((error: string) => {
    console.error('Search error:', error)
    setSearchError(error)
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 16px 0',
            }}
          >
            🔍 Typesense Search Demo
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: '#6b7280',
              margin: '0 0 24px 0',
            }}
          >
            Experience lightning-fast, typo-tolerant search with universal and collection-specific
            search
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              ✨ Universal Search
            </span>
            <span
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              🎯 Collection-Specific
            </span>
            <span
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              ⚡ Real-time Sync
            </span>
          </div>
        </div>

        {/* Search Stats */}
        {searchStats.totalSearches > 0 && (
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '32px',
              border: '1px solid #e1e5e9',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                color: '#374151',
                fontSize: '18px',
              }}
            >
              📊 Search Statistics
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                fontSize: '14px',
                color: '#6b7280',
              }}
            >
              <span>
                Total searches: <strong>{searchStats.totalSearches}</strong>
              </span>
              <span>
                Total results: <strong>{searchStats.totalResults}</strong>
              </span>
              <span>
                Average results: <strong>{searchStats.averageResults}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Search Examples Section */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '32px',
            border: '1px solid #e1e5e9',
          }}
        >
          <h2
            style={{
              margin: '0 0 24px 0',
              color: '#374151',
              fontSize: '24px',
              textAlign: 'center',
            }}
          >
            🚀 Search Examples
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Universal Search */}
            <div
              style={{
                padding: '24px',
                border: '2px solid #10b981',
                borderRadius: '12px',
                backgroundColor: '#f0fdf4',
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px 0',
                  color: '#065f46',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                ✨ Universal Search
              </h3>
              <p
                style={{
                  margin: '0 0 16px 0',
                  color: '#047857',
                  fontSize: '14px',
                }}
              >
                Search across all collections at once
              </p>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1fae5',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#065f46',
                }}
              >
                GET /api/search?q=server
              </div>
            </div>

            {/* Collection-Specific Search */}
            <div
              style={{
                padding: '24px',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px 0',
                  color: '#1e40af',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🎯 Collection-Specific
              </h3>
              <p
                style={{
                  margin: '0 0 16px 0',
                  color: '#2563eb',
                  fontSize: '14px',
                }}
              >
                Search within specific collections
              </p>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#1e40af',
                }}
              >
                GET /api/search/posts?q=server
                <br />
                GET /api/search/portfolio?q=design
                <br />
                GET /api/search/products?q=laptop
              </div>
            </div>
          </div>
        </div>

        {/* Unified Search Component */}
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto 40px auto',
          }}
        >
          <div
            style={{
              padding: '32px',
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
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'center',
              }}
            >
              🔍 Universal Search
            </h2>
            <p
              style={{
                margin: '0 0 24px 0',
                color: '#6b7280',
                textAlign: 'center',
                fontSize: '16px',
              }}
            >
              Search across all collections: Posts, Portfolio, Products, and Media
            </p>
            <UnifiedSearchInput
              baseUrl="http://localhost:3000"
              placeholder="Search everything..."
              onResultClick={handleResultClick}
              onSearch={handleSearch}
              onResults={handleResults}
              onError={handleSearchError}
              debounceMs={300}
              minQueryLength={2}
              perPage={10}
              showLoading={true}
              showSearchTime={true}
              showResultCount={true}
            />

            {/* Error Display */}
            {searchError && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontSize: '14px',
                }}
              >
                <strong>Search Error:</strong> {searchError}
              </div>
            )}

            {/* Debug Info */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#64748b',
              }}
            >
              <strong>Debug Info:</strong> Search endpoint:{' '}
              <code>http://localhost:3000/api/search</code>
              <br />
              Collections endpoint: <code>http://localhost:3000/api/search/collections</code>
            </div>
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '32px',
              border: '1px solid #e1e5e9',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                color: '#374151',
                fontSize: '18px',
              }}
            >
              📝 Recent Searches
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {searchHistory.map((query, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  {query}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Selected Result */}
        {selectedResult && (
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e1e5e9',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                color: '#374151',
                fontSize: '18px',
              }}
            >
              📄 Selected Result
            </h3>
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#374151',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(selectedResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e1e5e9',
            marginTop: '32px',
          }}
        >
          <h3
            style={{
              margin: '0 0 24px 0',
              color: '#374151',
              fontSize: '24px',
              textAlign: 'center',
            }}
          >
            🚀 Features
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                ⚡ Lightning Fast
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                Sub-millisecond search response times powered by Typesense's optimized search
                engine.
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                🎯 Accurate Results
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                Precise matching with configurable typo tolerance for optimal search accuracy.
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                🌐 Universal Search
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                Search across all collections simultaneously with unified results and collection
                metadata.
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                🎯 Collection-Specific
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                Target specific collections for focused, high-performance searches.
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                📱 Responsive Design
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                Mobile-first design that works perfectly on all devices and screen sizes.
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                🎨 Customizable
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                Fully customizable UI, search behavior, and result rendering.
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                🔄 Real-time Sync
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                Automatic synchronization with Payload CMS changes for always up-to-date results.
              </p>
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginTop: '32px',
            border: '1px solid #e1e5e9',
          }}
        >
          <h3
            style={{
              margin: '0 0 24px 0',
              color: '#374151',
              fontSize: '24px',
              textAlign: 'center',
            }}
          >
            📚 API Documentation
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
            }}
          >
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                Universal Search
              </h4>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#374151',
                }}
              >
                <div style={{ color: '#059669', marginBottom: '8px' }}>
                  GET /api/search?q=server
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  Returns results from all enabled collections
                </div>
              </div>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                Collection-Specific
              </h4>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#374151',
                }}
              >
                <div style={{ color: '#2563eb', marginBottom: '8px' }}>
                  GET /api/search/posts?q=server
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  Returns results only from posts collection
                </div>
              </div>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                Collections List
              </h4>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#374151',
                }}
              >
                <div style={{ color: '#7c3aed', marginBottom: '8px' }}>
                  GET /api/search/collections
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  Returns list of available collections
                </div>
              </div>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '18px',
                }}
              >
                Search Suggestions
              </h4>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#374151',
                }}
              >
                <div style={{ color: '#dc2626', marginBottom: '8px' }}>
                  GET /api/search/posts/suggest?q=ser
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  Returns search suggestions for autocomplete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginTop: '32px',
          }}
        >
          <h3
            style={{
              margin: '0 0 20px 0',
              color: '#374151',
              fontSize: '20px',
            }}
          >
            💡 How to Use
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '8px',
                  fontSize: '16px',
                }}
              >
                1. Universal Search
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Use the search box above to search across all collections simultaneously.
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '8px',
                  fontSize: '16px',
                }}
              >
                2. Collection-Specific
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Use API endpoints like /api/search/posts?q=term for targeted searches.
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '8px',
                  fontSize: '16px',
                }}
              >
                3. View Results
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Results show collection icons, metadata, and highlighted matches.
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: '#1f2937',
                  marginBottom: '8px',
                  fontSize: '16px',
                }}
              >
                4. Real-time Updates
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Search results update automatically when content changes in Payload CMS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchDemoPage
