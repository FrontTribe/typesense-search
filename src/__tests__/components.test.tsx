import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import UnifiedSearchInput from '../components/UnifiedSearchInput'

// Mock fetch
global.fetch = vi.fn()

// Mock CSS modules
vi.mock('../components/HeadlessSearchInput.module.css', () => ({
  default: {
    collectionIcon: 'collection-icon',
    collectionName: 'collection-name',
    error: 'error',
    errorIcon: 'error-icon',
    errorMessage: 'error-message',
    inputLoading: 'input-loading',
    loading: 'loading',
    noResults: 'no-results',
    noResultsDescription: 'no-results-description',
    noResultsIcon: 'no-results-icon',
    noResultsTitle: 'no-results-title',
    resultCount: 'result-count',
    resultDescription: 'result-description',
    resultHeader: 'result-header',
    resultHighlight: 'result-highlight',
    resultMeta: 'result-meta',
    resultsContainer: 'results-container',
    resultsList: 'results-list',
    resultTitle: 'result-title',
    searchContainer: 'search-container',
    searchInput: 'search-input',
    searchInputContainer: 'search-input-container',
    searchResult: 'search-result',
    spinner: 'spinner',
  },
}))

describe('UnifiedSearchInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock successful collections response
    ;(global.fetch as unknown as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/search/collections')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              categorized: true,
              collections: [
                {
                  slug: 'posts',
                  displayName: 'Blog Posts',
                  facetFields: ['category', 'status'],
                  icon: '📝',
                  searchFields: ['title', 'content'],
                },
                {
                  slug: 'portfolio',
                  displayName: 'Portfolio',
                  facetFields: ['status', 'featured'],
                  icon: '💼',
                  searchFields: ['title', 'description'],
                },
              ],
            }),
          ok: true,
        })
      }
      if (url.includes('/search?q=')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              found: 1,
              hits: [
                {
                  collection: 'posts',
                  displayName: 'Blog Posts',
                  document: {
                    id: '1',
                    _collection: 'posts',
                    title: 'Test Post',
                  },
                  highlight: {
                    title: { snippet: 'Test <mark>Post</mark>' },
                  },
                  icon: '📝',
                  text_match: 100,
                },
              ],
              page: 1,
              search_time_ms: 5,
            }),
          ok: true,
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  test('should render search input with placeholder', () => {
    render(<UnifiedSearchInput baseUrl="http://localhost:3000" />)

    const input = screen.getByPlaceholderText('Search...')
    expect(input).toBeInTheDocument()
  })

  test('should render custom placeholder', () => {
    render(
      <UnifiedSearchInput baseUrl="http://localhost:3000" placeholder="Search everything..." />,
    )

    const input = screen.getByPlaceholderText('Search everything...')
    expect(input).toBeInTheDocument()
  })

  test('should fetch collections on mount', async () => {
    render(<UnifiedSearchInput baseUrl="http://localhost:3000" />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/search/collections')
    })
  })

  test('should perform search when typing', async () => {
    render(<UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} />)

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/search?q=test&per_page=10',
        )
      },
      { timeout: 200 },
    )
  })

  test('should not search with query shorter than minQueryLength', async () => {
    render(
      <UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} minQueryLength={3} />,
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'te' } })

    await waitFor(
      () => {
        expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/search?q=te'))
      },
      { timeout: 200 },
    )
  })

  test('should display search results', async () => {
    render(<UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} />)

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(screen.getByText('Test Post')).toBeInTheDocument()
      },
      { timeout: 200 },
    )
  })

  test('should display collection metadata in results', async () => {
    render(<UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} />)

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(screen.getByText('📝')).toBeInTheDocument()
        expect(screen.getByText('Blog Posts')).toBeInTheDocument()
      },
      { timeout: 200 },
    )
  })

  test('should call onSearch callback', async () => {
    const onSearch = vi.fn()
    render(
      <UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} onSearch={onSearch} />,
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(onSearch).toHaveBeenCalledWith('test')
      },
      { timeout: 200 },
    )
  })

  test('should call onResults callback', async () => {
    const onResults = vi.fn()
    render(
      <UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} onResults={onResults} />,
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(onResults).toHaveBeenCalledWith({
          found: 1,
          hits: expect.any(Array),
          page: 1,
          search_time_ms: 5,
        })
      },
      { timeout: 200 },
    )
  })

  test('should call onResultClick when result is clicked', async () => {
    const onResultClick = vi.fn()
    render(
      <UnifiedSearchInput
        baseUrl="http://localhost:3000"
        debounceMs={100}
        onResultClick={onResultClick}
      />,
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        const result = screen.getByText('Test Post')
        fireEvent.click(result)
        expect(onResultClick).toHaveBeenCalledWith({
          collection: 'posts',
          displayName: 'Blog Posts',
          document: {
            id: '1',
            _collection: 'posts',
            title: 'Test Post',
          },
          highlight: {
            title: { snippet: 'Test <mark>Post</mark>' },
          },
          icon: '📝',
          text_match: 100,
        })
      },
      { timeout: 200 },
    )
  })

  test('should handle search errors', async () => {
    const onError = vi.fn()
    ;(global.fetch as unknown as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/search?q=')) {
        return Promise.reject(new Error('Search failed'))
      }
      return Promise.resolve({
        json: () => Promise.resolve({ collections: [] }),
        ok: true,
      })
    })

    render(
      <UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} onError={onError} />,
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(onError).toHaveBeenCalledWith('Search failed')
      },
      { timeout: 200 },
    )
  })

  test('should display loading state', async () => {
    ;(global.fetch as unknown as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/search?q=')) {
        return new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                json: () => Promise.resolve({ found: 0, hits: [], page: 1, search_time_ms: 0 }),
                ok: true,
              }),
            100,
          )
        })
      }
      return Promise.resolve({
        json: () => Promise.resolve({ collections: [] }),
        ok: true,
      })
    })

    render(<UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} />)

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(screen.getByText('Searching across all collections...')).toBeInTheDocument()
      },
      { timeout: 200 },
    )
  })

  test('should display no results message', async () => {
    ;(global.fetch as unknown as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/search?q=')) {
        return Promise.resolve({
          json: () => Promise.resolve({ found: 0, hits: [], page: 1, search_time_ms: 0 }),
          ok: true,
        })
      }
      return Promise.resolve({
        json: () => Promise.resolve({ collections: [] }),
        ok: true,
      })
    })

    render(<UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} />)

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(screen.getByText('No results found for "test"')).toBeInTheDocument()
      },
      { timeout: 200 },
    )
  })

  test('should close results when clicking outside', async () => {
    render(<UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} />)

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(screen.getByText('Test Post')).toBeInTheDocument()
      },
      { timeout: 200 },
    )

    // Click outside
    fireEvent.mouseDown(document.body)

    await waitFor(() => {
      expect(screen.queryByText('Test Post')).not.toBeInTheDocument()
    })
  })

  test('should close results when pressing Escape', async () => {
    render(<UnifiedSearchInput baseUrl="http://localhost:3000" debounceMs={100} />)

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(screen.getByText('Test Post')).toBeInTheDocument()
      },
      { timeout: 200 },
    )

    // Press Escape
    fireEvent.keyDown(input, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('Test Post')).not.toBeInTheDocument()
    })
  })

  test('should use custom renderResult function', async () => {
    const customRenderResult = vi.fn((hit) => (
      <div data-testid="custom-result" key={hit.document.id}>
        Custom: {hit.document.title}
      </div>
    ))

    render(
      <UnifiedSearchInput
        baseUrl="http://localhost:3000"
        debounceMs={100}
        renderResult={customRenderResult}
      />,
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(customRenderResult).toHaveBeenCalled()
        expect(screen.getByTestId('custom-result')).toBeInTheDocument()
        expect(screen.getByText('Custom: Test Post')).toBeInTheDocument()
      },
      { timeout: 200 },
    )
  })

  test('should use custom renderNoResults function', async () => {
    const customRenderNoResults = vi.fn((query) => (
      <div data-testid="custom-no-results">No results for: {query}</div>
    ))

    ;(global.fetch as unknown as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/search?q=')) {
        return Promise.resolve({
          json: () => Promise.resolve({ found: 0, hits: [], page: 1, search_time_ms: 0 }),
          ok: true,
        })
      }
      return Promise.resolve({
        json: () => Promise.resolve({ collections: [] }),
        ok: true,
      })
    })

    render(
      <UnifiedSearchInput
        baseUrl="http://localhost:3000"
        debounceMs={100}
        renderNoResults={customRenderNoResults}
      />,
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(customRenderNoResults).toHaveBeenCalledWith('test')
        expect(screen.getByTestId('custom-no-results')).toBeInTheDocument()
        expect(screen.getByText('No results for: test')).toBeInTheDocument()
      },
      { timeout: 200 },
    )
  })
})
