'use client'

import React, { useState } from 'react'
import HeadlessSearchInput from './HeadlessSearchInput.js'
import type { SearchResult, SearchResponse } from '../lib/types.js'
import styles from './HeadlessSearchInput.module.css'

// Example usage component
export const SearchExample: React.FC = () => {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result)
    console.log('Result clicked:', result)
  }

  const handleSearch = (query: string) => {
    console.log('Search performed:', query)
    setSearchHistory((prev) => [query, ...prev.filter((q) => q !== query)].slice(0, 5))
  }

  const handleResults = (results: SearchResponse) => {
    console.log('Search results received:', results)
  }

  const customRenderResult = (result: SearchResult, index: number) => (
    <div
      key={result.id}
      data-result-item
      tabIndex={0}
      className={`${styles['search-result-item']} custom-result-item`}
      onClick={() => handleResultClick(result)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleResultClick(result)
        }
      }}
      style={{
        padding: '16px',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          {result.title}
        </h3>
        <span
          style={{
            fontSize: '12px',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '2px 8px',
            borderRadius: '12px',
          }}
        >
          {result.document.status}
        </span>
      </div>

      {result.highlight && (
        <div
          style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
            lineHeight: '1.5',
          }}
          dangerouslySetInnerHTML={{ __html: result.highlight }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          Category: {result.document.category}
        </span>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          Updated: {result.updatedAt ? new Date(result.updatedAt).toLocaleDateString() : 'Unknown'}
        </span>
      </div>
    </div>
  )

  const customRenderNoResults = (query: string) => (
    <div
      style={{
        padding: '24px',
        textAlign: 'center',
        color: '#6b7280',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e1e5e9',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
      <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
        No results found
      </div>
      <div style={{ fontSize: '14px' }}>
        Try searching for something else or check your spelling
      </div>
    </div>
  )

  const customRenderLoading = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        color: '#6b7280',
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          border: '2px solid #e1e5e9',
          borderTop: '2px solid #0070f3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '8px',
        }}
      />
      Searching...
    </div>
  )

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#1f2937' }}>
        Typesense Search Example
      </h1>

      {/* Basic Search Input */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', color: '#374151' }}>Basic Search</h2>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          collection="posts"
          placeholder="Search posts..."
          onResultClick={handleResultClick}
          onSearch={handleSearch}
          className={styles['headless-search-input']}
        />
      </div>

      {/* Advanced Search Input with Custom Rendering */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', color: '#374151' }}>
          Advanced Search with Custom Rendering
        </h2>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          collection="posts"
          placeholder="Search with custom results..."
          perPage={5}
          debounceMs={500}
          minQueryLength={3}
          renderResult={customRenderResult}
          renderNoResults={customRenderNoResults}
          renderLoading={customRenderLoading}
          onResultClick={handleResultClick}
          onSearch={handleSearch}
          className={styles['headless-search-input']}
        />
      </div>

      {/* Media Search */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', color: '#374151' }}>Media Search</h2>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          collection="media"
          placeholder="Search media files..."
          onResultClick={(result) => console.log('Media clicked:', result)}
          className={styles['headless-search-input']}
        />
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
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() => console.log('Search again:', query)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
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
            marginBottom: '40px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e1e5e9',
          }}
        >
          <h2 style={{ marginBottom: '16px', color: '#374151' }}>Selected Result</h2>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{selectedResult.title}</h3>
            <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>
              Category: {selectedResult.document.category} | Status:{' '}
              {selectedResult.document.status} | Updated:{' '}
              {selectedResult.updatedAt ? new Date(selectedResult.updatedAt).toLocaleDateString() : 'Unknown'}
            </p>
            {selectedResult.content && (
              <p style={{ margin: 0, color: '#374151', lineHeight: '1.6' }}>
                {selectedResult.content}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Integration Code Example */}
      <div
        style={{
          marginBottom: '40px',
          padding: '20px',
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          color: '#f9fafb',
        }}
      >
        <h2 style={{ marginBottom: '16px', color: '#f9fafb' }}>Integration Code</h2>
        <pre
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.5',
            overflow: 'auto',
          }}
        >
          {`import HeadlessSearchInput from './HeadlessSearchInput'

function MyComponent() {
  return (
    <HeadlessSearchInput
      baseUrl="http://localhost:3000"
      collection="posts"
      placeholder="Search posts..."
      onResultClick={(result) => {
        // Handle result click
        console.log('Clicked:', result)
      }}
      onSearch={(query) => {
        // Handle search
        console.log('Searched:', query)
      }}
    />
  )
}`}
        </pre>
      </div>
    </div>
  )
}

export default SearchExample
