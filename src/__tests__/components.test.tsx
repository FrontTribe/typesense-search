import { describe, expect, test, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import UnifiedSearchInput from '../components/UnifiedSearchInput'

// Mock fetch
global.fetch = vi.fn()

// Mock CSS modules
vi.mock('../components/HeadlessSearchInput.module.css', () => ({
  default: {
    searchContainer: 'search-container',
    searchInputContainer: 'search-input-container',
    searchInput: 'search-input',
    resultsContainer: 'results-container',
    resultsList: 'results-list',
    searchResult: 'search-result',
    resultHeader: 'result-header',
    collectionIcon: 'collection-icon',
    collectionName: 'collection-name',
    resultTitle: 'result-title',
    resultDescription: 'result-description',
    resultHighlight: 'result-highlight',
    resultMeta: 'result-meta',
    noResults: 'no-results',
    noResultsIcon: 'no-results-icon',
    noResultsTitle: 'no-results-title',
    noResultsDescription: 'no-results-description',
    loading: 'loading',
    spinner: 'spinner',
    error: 'error',
    errorIcon: 'error-icon',
    errorMessage: 'error-message',
    resultCount: 'result-count',
    inputLoading: 'input-loading',
  },
}))

describe('UnifiedSearchInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock successful collections response
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/search/collections')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              collections: [
                {
                  slug: 'posts',
                  displayName: 'Blog Posts',
                  icon: '📝',
                  searchFields: ['title', 'content'],
                  facetFields: ['category', 'status'],
                },
                {
                  slug: 'portfolio',
                  displayName: 'Portfolio',
                  icon: '💼',
                  searchFields: ['title', 'description'],
                  facetFields: ['status', 'featured'],
                },
              ],
              categorized: true,
            }),
        })
      }
      if (url.includes('/search?q=')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              hits: [
                {
                  document: {
                    id: '1',
                    title: 'Test Post',
                    _collection: 'posts',
                  },
                  highlight: {
                    title: { snippet: 'Test <mark>Post</mark>' },
                  },
                  collection: 'posts',
                  displayName: 'Blog Posts',
                  icon: '📝',
                  text_match: 100,
                },
              ],
              found: 1,
              page: 1,
              search_time_ms: 5,
            }),
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
      <UnifiedSearchInput baseUrl="http://localhost:3000" minQueryLength={3} debounceMs={100} />,
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
      <UnifiedSearchInput baseUrl="http://localhost:3000" onSearch={onSearch} debounceMs={100} />,
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
      <UnifiedSearchInput baseUrl="http://localhost:3000" onResults={onResults} debounceMs={100} />,
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(onResults).toHaveBeenCalledWith({
          hits: expect.any(Array),
          found: 1,
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
        onResultClick={onResultClick}
        debounceMs={100}
      />,
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(
      () => {
        const result = screen.getByText('Test Post')
        fireEvent.click(result)
        expect(onResultClick).toHaveBeenCalledWith({
          document: {
            id: '1',
            title: 'Test Post',
            _collection: 'posts',
          },
          highlight: {
            title: { snippet: 'Test <mark>Post</mark>' },
          },
          collection: 'posts',
          displayName: 'Blog Posts',
          icon: '📝',
          text_match: 100,
        })
      },
      { timeout: 200 },
    )
  })

  test('should handle search errors', async () => {
    const onError = vi.fn()
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/search?q=')) {
        return Promise.reject(new Error('Search failed'))
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ collections: [] }),
      })
    })

    render(
      <UnifiedSearchInput baseUrl="http://localhost:3000" onError={onError} debounceMs={100} />,
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
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/search?q=')) {
        return new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ hits: [], found: 0, page: 1, search_time_ms: 0 }),
              }),
            100,
          )
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ collections: [] }),
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
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/search?q=')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hits: [], found: 0, page: 1, search_time_ms: 0 }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ collections: [] }),
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
      <div key={hit.document.id} data-testid="custom-result">
        Custom: {hit.document.title}
      </div>
    ))

    render(
      <UnifiedSearchInput
        baseUrl="http://localhost:3000"
        renderResult={customRenderResult}
        debounceMs={100}
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

    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/search?q=')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ hits: [], found: 0, page: 1, search_time_ms: 0 }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ collections: [] }),
      })
    })

    render(
      <UnifiedSearchInput
        baseUrl="http://localhost:3000"
        renderNoResults={customRenderNoResults}
        debounceMs={100}
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
