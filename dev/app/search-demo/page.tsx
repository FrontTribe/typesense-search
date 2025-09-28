'use client'

import React, { useState, useCallback } from 'react'
import HeadlessSearchInput from '../../../src/components/HeadlessSearchInput.js'
import type { SearchResult } from '../../../src/lib/types.js'
import type { ThemeConfig } from '../../../src/components/themes/types.js'

type ConfigurationType = 'single' | 'multiple' | 'universal'

interface Configuration {
  id: ConfigurationType
  name: string
  description: string
  config: {
    collection?: string
    collections?: string[]
    placeholder: string
    endpoint: string
  }
  testQuery: string
}

const configurations: Configuration[] = [
  {
    id: 'single',
    name: 'Single Collection',
    description: 'Search within posts collection only',
    config: {
      collection: 'posts',
      placeholder: 'Search posts...',
      endpoint: '/api/search/posts',
    },
    testQuery: 'Next.js',
  },
  {
    id: 'multiple',
    name: 'Multiple Collections',
    description: 'Search within portfolio and products collections',
    config: {
      collections: ['portfolio', 'products'],
      placeholder: 'Search portfolio & products...',
      endpoint: '/api/search (with client filtering)',
    },
    testQuery: 'design',
  },
  {
    id: 'universal',
    name: 'Universal Search',
    description: 'Search across all collections',
    config: {
      placeholder: 'Search all collections...',
      endpoint: '/api/search',
    },
    testQuery: 'TypeScript',
  },
]

const SearchDemoPage = () => {
  const [activeConfig, setActiveConfig] = useState<ConfigurationType>('single')
  const [selectedResult, setSelectedResult] = useState<SearchResult['document'] | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [lastResults, setLastResults] = useState<any>(null)

  // Theme system state
  const [selectedTheme, setSelectedTheme] = useState<string>('modern')
  const [customConfig, setCustomConfig] = useState<Partial<ThemeConfig>>({})
  const [showThemeConfig, setShowThemeConfig] = useState(false)

  const currentConfig = configurations.find((config) => config.id === activeConfig)!

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log('Result selected:', result.document)
    setSelectedResult(result.document)
  }, [])

  const handleSearch = useCallback((query: string, results?: any) => {
    console.log('Search performed:', query, results)
    setSearchHistory((prev) => [query, ...prev.slice(0, 9)])
    setLastResults(results)
    setSearchError(null)
  }, [])

  const handleResults = useCallback((results: any) => {
    console.log('Search results:', results)
    setLastResults(results)
    setSearchError(null)
  }, [])

  const handleSearchError = useCallback((error: string) => {
    console.error('Search error:', error)
    setSearchError(error)
  }, [])

  const runTest = useCallback(() => {
    console.log(`Running test for ${currentConfig.name}: ${currentConfig.testQuery}`)
  }, [currentConfig])

  // Theme configuration helpers
  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme)
    setCustomConfig({})
    setShowThemeConfig(false)
  }

  const handleCustomConfigChange = (field: string, value: any) => {
    setCustomConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getCurrentTheme = (): string | ThemeConfig => {
    if (showThemeConfig && Object.keys(customConfig).length > 0) {
      return {
        theme: selectedTheme,
        ...customConfig,
      }
    }
    return selectedTheme
  }

  const themeOptions = [
    { name: 'modern', label: 'Modern' },
    { name: 'minimal', label: 'Minimal' },
    { name: 'elegant', label: 'Elegant' },
    { name: 'dark', label: 'Dark' },
    { name: 'colorful', label: 'Colorful' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🔍 Typesense Search Demo</h1>
          <p className="text-xl text-gray-600 mb-6">
            Test different search configurations with a single component
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✨ Multi-Collection Support
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              ⚡ Lightning Fast
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              🎯 Smart API Selection
            </span>
          </div>
        </div>

        {/* Configuration Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {configurations.map((config) => (
              <button
                key={config.id}
                onClick={() => setActiveConfig(config.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  activeConfig === config.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{config.name}</h3>
                  {activeConfig === config.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                  {config.config.endpoint}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme System */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">🎨 Theme System</h2>
              <p className="text-gray-600 mt-1">Customize the appearance of the search component</p>
            </div>
            <button
              onClick={() => setShowThemeConfig(!showThemeConfig)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {showThemeConfig ? 'Hide' : 'Show'} Custom Config
            </button>
          </div>

          {/* Theme Selection */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Select Theme</h3>
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium ${
                    selectedTheme === theme.name
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Theme Configuration */}
          {showThemeConfig && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Colors */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Colors</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Input Border Focus</label>
                      <input
                        type="color"
                        value={customConfig.colors?.inputBorderFocus || '#3b82f6'}
                        onChange={(e) =>
                          handleCustomConfigChange('colors', {
                            ...customConfig.colors,
                            inputBorderFocus: e.target.value,
                          })
                        }
                        className="w-full h-10 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Input Background</label>
                      <input
                        type="color"
                        value={customConfig.colors?.inputBackground || '#ffffff'}
                        onChange={(e) =>
                          handleCustomConfigChange('colors', {
                            ...customConfig.colors,
                            inputBackground: e.target.value,
                          })
                        }
                        className="w-full h-10 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Spacing */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Spacing</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Input Padding</label>
                      <input
                        type="text"
                        value={customConfig.spacing?.inputPadding || '1rem 1.25rem'}
                        onChange={(e) =>
                          handleCustomConfigChange('spacing', {
                            ...customConfig.spacing,
                            inputPadding: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Border Radius</label>
                      <input
                        type="text"
                        value={customConfig.spacing?.inputBorderRadius || '0.75rem'}
                        onChange={(e) =>
                          handleCustomConfigChange('spacing', {
                            ...customConfig.spacing,
                            inputBorderRadius: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Options</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={customConfig.enableAnimations !== false}
                        onChange={(e) =>
                          handleCustomConfigChange('enableAnimations', e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable Animations</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={customConfig.enableShadows !== false}
                        onChange={(e) =>
                          handleCustomConfigChange('enableShadows', e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable Shadows</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={customConfig.enableRoundedCorners !== false}
                        onChange={(e) =>
                          handleCustomConfigChange('enableRoundedCorners', e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Rounded Corners</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Component */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{currentConfig.name} Search</h2>
              <p className="text-gray-600 mt-1">{currentConfig.description}</p>
            </div>
            <button
              onClick={runTest}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Test: "{currentConfig.testQuery}"
            </button>
          </div>

          <HeadlessSearchInput
            baseUrl="http://localhost:3000"
            {...currentConfig.config}
            theme={getCurrentTheme()}
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
            className="w-full"
          />

          {/* Error Display */}
          {searchError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Search Error</h3>
                  <p className="text-sm text-red-700 mt-1">{searchError}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Showcase */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">🎨 All Themes Showcase</h2>
          <p className="text-gray-600 mb-6">Compare all available themes side by side</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themeOptions.map((theme) => (
              <div key={theme.name} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">{theme.label}</h3>
                <HeadlessSearchInput
                  baseUrl="http://localhost:3000"
                  {...currentConfig.config}
                  theme={theme.name}
                  placeholder={`Search with ${theme.label.toLowerCase()}...`}
                  onResultClick={handleResultClick}
                  onSearch={handleSearch}
                  onResults={handleResults}
                  onError={handleSearchError}
                  debounceMs={300}
                  minQueryLength={2}
                  perPage={5}
                  showLoading={false}
                  showSearchTime={false}
                  showResultCount={false}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results & Debug Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Last Results</h3>
            {lastResults ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Results Found:</span>
                  <span className="text-sm font-bold text-gray-900">{lastResults.found}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Search Time:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {lastResults.search_time_ms}ms
                  </span>
                </div>
                {lastResults.collections && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 block mb-2">
                      Collections:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {lastResults.collections.map((col: any, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {col.collection} ({col.found})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No search results yet</p>
            )}
          </div>

          {/* Debug Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Active Configuration
                </label>
                <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                  {currentConfig.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
                <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                  {currentConfig.config.endpoint}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search History
                </label>
                <div className="p-3 bg-gray-50 rounded-lg max-h-24 overflow-y-auto">
                  {searchHistory.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.slice(0, 5).map((query, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800"
                        >
                          {query}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No searches yet</p>
                  )}
                </div>
              </div>

              {selectedResult && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selected Result
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedResult.title || selectedResult.name || 'Untitled'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ID: {selectedResult.id}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Theme
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 capitalize">{selectedTheme}</p>
                  {showThemeConfig && Object.keys(customConfig).length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">+ Custom configuration</p>
                  )}
                </div>
              </div>

              {showThemeConfig && Object.keys(customConfig).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme Configuration
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                    <pre className="text-xs text-gray-700">
                      {JSON.stringify(customConfig, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 How to Test</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">1. Switch Configurations</h4>
              <p className="text-sm text-blue-700">
                Click different configuration cards above to test single collection, multiple
                collections, or universal search.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">2. Test Themes</h4>
              <p className="text-sm text-blue-700">
                Select different themes to see various styling options. Use custom configuration to
                override colors, spacing, and options.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">3. Test Search</h4>
              <p className="text-sm text-blue-700">
                Use the "Test" button or type in the search input to see how different
                configurations behave.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">4. Monitor Results</h4>
              <p className="text-sm text-blue-700">
                Check the debug panel to see which API endpoint is called, current theme, and verify
                the results.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">🚀 Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Lightning Fast</h4>
              <p className="text-sm text-gray-600">
                Sub-millisecond search response times powered by Typesense's optimized engine.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart API Selection</h4>
              <p className="text-sm text-gray-600">
                Automatically chooses the most efficient API endpoint based on your configuration.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔍</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Flexible Search</h4>
              <p className="text-sm text-gray-600">
                Single component supporting single, multiple, or universal collection search.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Theme System</h4>
              <p className="text-sm text-gray-600">
                5 pre-built themes with unlimited customization options for colors, spacing, and
                animations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchDemoPage
