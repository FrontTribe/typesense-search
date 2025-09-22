'use client'

import React, { useState, useCallback } from 'react'
import UnifiedSearchInput from '../../../src/components/UnifiedSearchInput.js'
import type { SearchHit } from '../../../src/components/HeadlessSearchInput.js'

const SearchDemoPage = () => {
  const [selectedResult, setSelectedResult] = useState<SearchHit['document'] | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    totalResults: 0,
    averageResults: 0,
  })

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
    setSearchStats((prev) => ({
      totalSearches: prev.totalSearches + 1,
      totalResults: prev.totalResults + results.found,
      averageResults: Math.round((prev.totalResults + results.found) / (prev.totalSearches + 1)),
    }))
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
            Experience lightning-fast, typo-tolerant search across all collections
          </p>
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
              Search across all collections: Posts, Media, and Portfolio
            </p>
            <UnifiedSearchInput
              baseUrl="http://localhost:3000"
              placeholder="Search everything..."
              onResultClick={handleResultClick}
              onSearch={handleSearch}
              onResults={handleResults}
              debounceMs={300}
              minQueryLength={2}
              perPage={10}
              showLoading={true}
              showSearchTime={true}
              showResultCount={true}
            />
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
                🔍 Multi-Collection
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                Search across multiple collections simultaneously with unified results.
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
                1. Start Typing
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Type at least 2 characters to trigger the search. Results appear as you type.
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
                2. Browse Results
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Results are grouped by collection with icons and highlighted matches.
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
                3. Click to View
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Click on any result to see its full details and metadata.
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
                4. Try Different Terms
              </h4>
              <p
                style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Experiment with different search terms to explore the content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchDemoPage
