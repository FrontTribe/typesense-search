import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// Type for vi.Mock
type MockFunction = ReturnType<typeof vi.fn>

import HeadlessSearchInput from '../components/HeadlessSearchInput.js'

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

describe('HeadlessSearchInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock successful search response
    ;(global.fetch as unknown as MockFunction).mockImplementation((url: string) => {
      if (url.includes('/search/posts')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              collections: [{ collection: 'posts', found: 1 }],
              found: 1,
              hits: [
                {
                  collection: 'posts',
                  document: { id: '1', content: 'Test content', title: 'Test Post' },
                },
              ],
              page: 1,
              search_time_ms: 5,
            }),
          ok: true,
        })
      }
      return Promise.resolve({ ok: false, status: 404 })
    })
  })

  test('renders search input with placeholder', () => {
    render(<HeadlessSearchInput baseUrl="http://localhost:3000" collection="posts" />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  test('renders with custom placeholder', () => {
    render(
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        placeholder="Custom placeholder"
      />,
    )
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })

  test('performs search on input change', async () => {
    render(<HeadlessSearchInput baseUrl="http://localhost:3000" collection="posts" />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/search/posts?q=test%20query&per_page=10',
      )
    })
  })

  test('calls onSearch callback when search is performed', async () => {
    const onSearchMock = vi.fn()
    render(
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        onSearch={onSearchMock}
      />,
    )
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })

    await waitFor(() => {
      expect(onSearchMock).toHaveBeenCalledWith('test query', expect.any(Object))
    })
  })

  test('calls onResults callback when results are received', async () => {
    const onResultsMock = vi.fn()
    render(
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        onResults={onResultsMock}
      />,
    )
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })

    await waitFor(() => {
      expect(onResultsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          found: 1,
          hits: expect.any(Array),
        }),
      )
    })
  })

  test('displays loading state during search', async () => {
    render(
      <HeadlessSearchInput baseUrl="http://localhost:3000" collection="posts" showLoading={true} />,
    )
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })

    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument()
    })
  })

  test('displays search results', async () => {
    render(<HeadlessSearchInput baseUrl="http://localhost:3000" collection="posts" />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })
  })

  test('displays result count', async () => {
    render(
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        showResultCount={true}
      />,
    )
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })

    await waitFor(() => {
      expect(screen.getByText('Found 1 result in 5ms')).toBeInTheDocument()
    })
  })

  test('displays no results message', async () => {
    ;(global.fetch as unknown as MockFunction).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            collections: [{ collection: 'posts', found: 0 }],
            found: 0,
            hits: [],
            page: 1,
            search_time_ms: 2,
          }),
        ok: true,
      }),
    )

    render(<HeadlessSearchInput baseUrl="http://localhost:3000" collection="posts" />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'no results' } })

    await waitFor(() => {
      expect(screen.getByText('No results found for "no results"')).toBeInTheDocument()
    })
  })

  test('handles search error', async () => {
    ;(global.fetch as unknown as MockFunction).mockImplementation(() =>
      Promise.resolve({ ok: false, status: 500 }),
    )

    const onErrorMock = vi.fn()
    render(
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        onError={onErrorMock}
      />,
    )
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'error query' } })

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith(expect.stringContaining('Search failed'))
    })
  })

  test('respects minQueryLength', async () => {
    render(
      <HeadlessSearchInput baseUrl="http://localhost:3000" collection="posts" minQueryLength={3} />,
    )
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'ab' } })

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  test('respects debounceMs', async () => {
    vi.useFakeTimers()
    render(
      <HeadlessSearchInput baseUrl="http://localhost:3000" collection="posts" debounceMs={500} />,
    )
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test' } })

    // Should not have called fetch yet
    expect(global.fetch).not.toHaveBeenCalled()

    // Fast forward time
    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    vi.useRealTimers()
  })

  test('handles result click', async () => {
    const onResultClickMock = vi.fn()
    render(
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        onResultClick={onResultClickMock}
      />,
    )
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Test Post'))

    expect(onResultClickMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        document: expect.objectContaining({ id: '1', title: 'Test Post' }),
      }),
    )
  })

  test('renders with custom className', () => {
    render(
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        className="custom-class"
        collection="posts"
      />,
    )
    const container = screen.getByPlaceholderText('Search...').closest('div')
    expect(container).toHaveClass('custom-class')
  })

  test('renders with custom input className', () => {
    render(
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        inputClassName="custom-input"
      />,
    )
    const input = screen.getByPlaceholderText('Search...')
    expect(input).toHaveClass('custom-input')
  })

  test('renders with custom perPage', async () => {
    render(<HeadlessSearchInput baseUrl="http://localhost:3000" collection="posts" perPage={5} />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/search/posts?q=test%20query&per_page=5',
      )
    })
  })

  test('renders with custom baseUrl', async () => {
    render(<HeadlessSearchInput baseUrl="https://api.example.com" collection="posts" />)
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/search/posts?q=test%20query&per_page=10',
      )
    })
  })
})
