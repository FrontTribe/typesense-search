'use client'

import React, { useState } from 'react'

import type { SearchResponse, SearchResult } from '../lib/types.js'

import HeadlessSearchInput from './HeadlessSearchInput.js'
import styles from './HeadlessSearchInput.module.css'

// Example usage component
export const SearchExample: React.FC = () => {
  const [selectedResult, setSelectedResult] = useState<null | SearchResult>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result)
  }

  const handleSearch = (query: string) => {
    setSearchHistory((prev) => [query, ...prev.filter((q) => q !== query)].slice(0, 5))
  }

  const _handleResults = (_results: SearchResponse) => {
    // Handle results silently
  }

  const customRenderResult = (result: SearchResult, _index: number) => (
    <div
      className={`${styles['search-result-item']} custom-result-item`}
      data-result-item
      key={result.id}
      onClick={() => handleResultClick(result)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleResultClick(result)
        }
      }}
      role="button"
      style={{
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '8px',
        padding: '16px',
        transition: 'all 0.2s ease',
      }}
      tabIndex={0}
    >
      <div
        style={{
          alignItems: 'flex-start',
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <h3 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: 0 }}>
          {result.title}
        </h3>
        <span
          style={{
            backgroundColor: '#f3f4f6',
            borderRadius: '12px',
            color: '#6b7280',
            fontSize: '12px',
            padding: '2px 8px',
          }}
        >
          {result.document.status}
        </span>
      </div>

      {result.highlight && (
        <div
          dangerouslySetInnerHTML={{ __html: result.highlight }}
          style={{
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '8px',
          }}
        />
      )}

      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>
          Category: {result.document.category}
        </span>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>
          Updated: {result.updatedAt ? new Date(result.updatedAt).toLocaleDateString() : 'Unknown'}
        </span>
      </div>
    </div>
  )

  const customRenderNoResults = (_query: string) => (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        color: '#6b7280',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
        <span aria-label="search" role="img">
          🔍
        </span>
      </div>
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
        alignItems: 'center',
        color: '#6b7280',
        display: 'flex',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          animation: 'spin 1s linear infinite',
          border: '2px solid #e1e5e9',
          borderRadius: '50%',
          borderTop: '2px solid #0070f3',
          height: '20px',
          marginRight: '8px',
          width: '20px',
        }}
      />
      Searching...
    </div>
  )

  return (
    <div style={{ margin: '0 auto', maxWidth: '800px', padding: '20px' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '32px', textAlign: 'center' }}>
        Typesense Search Example
      </h1>

      {/* Basic Search Input */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#374151', marginBottom: '16px' }}>Basic Search</h2>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          className={styles['headless-search-input']}
          collection="posts"
          onResultClick={handleResultClick}
          onSearch={handleSearch}
          placeholder="Search posts..."
        />
      </div>

      {/* Advanced Search Input with Custom Rendering */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#374151', marginBottom: '16px' }}>
          Advanced Search with Custom Rendering
        </h2>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          className={styles['headless-search-input']}
          collection="posts"
          debounceMs={500}
          minQueryLength={3}
          onResultClick={handleResultClick}
          onSearch={handleSearch}
          perPage={5}
          placeholder="Search with custom results..."
          renderLoading={customRenderLoading}
          renderNoResults={customRenderNoResults}
          renderResult={customRenderResult}
        />
      </div>

      {/* Media Search */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#374151', marginBottom: '16px' }}>Media Search</h2>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          className={styles['headless-search-input']}
          collection="media"
          onResultClick={(_result) => {
            // Handle media click
          }}
          placeholder="Search media files..."
        />
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#374151', marginBottom: '16px' }}>Recent Searches</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {searchHistory.map((query, index) => (
              <span
                key={index}
                onClick={() => {
                  // Handle search again
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    // Handle search again
                  }
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                role="button"
                style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: '16px',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px 12px',
                  transition: 'background-color 0.2s ease',
                }}
                tabIndex={0}
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
            backgroundColor: '#f8f9fa',
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            marginBottom: '40px',
            padding: '20px',
          }}
        >
          <h2 style={{ color: '#374151', marginBottom: '16px' }}>Selected Result</h2>
          <div>
            <h3 style={{ color: '#1f2937', margin: '0 0 8px 0' }}>{selectedResult.title}</h3>
            <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
              Category: {selectedResult.document.category} | Status:{' '}
              {selectedResult.document.status} | Updated:{' '}
              {selectedResult.updatedAt
                ? new Date(selectedResult.updatedAt).toLocaleDateString()
                : 'Unknown'}
            </p>
            {selectedResult.content && (
              <p style={{ color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {selectedResult.content}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Integration Code Example */}
      <div
        style={{
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          color: '#f9fafb',
          marginBottom: '40px',
          padding: '20px',
        }}
      >
        <h2 style={{ color: '#f9fafb', marginBottom: '16px' }}>Integration Code</h2>
        <pre
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            margin: 0,
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
        // Handle result click
      }}
      onSearch={(query) => {
        // Handle search
        // Handle search
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
