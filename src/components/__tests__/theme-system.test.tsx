/**
 * Theme System Tests
 */

import type { ThemeConfig } from '../themes/types.js'

import { darkTheme, modernTheme } from '../themes/themes.js'
import {
  generateThemeClasses,
  isDarkTheme,
  isLightTheme,
  mergeThemeConfig,
} from '../themes/utils.js'

// Mock fetch for API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        found: 1,
        hits: [
          {
            collection: 'posts',
            document: { id: '1', content: 'Test content', title: 'Test Post' },
            highlight: { title: { snippet: 'Test <mark>Post</mark>' } },
            text_match: 95,
          },
        ],
        search_time_ms: 50,
      }),
    ok: true,
  }),
)

describe('Theme System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Theme Utilities', () => {
    test('should merge theme configuration correctly', () => {
      const config = {
        colors: {
          inputBorderFocus: '#10b981',
        },
        spacing: {
          inputPadding: '2rem',
        },
        theme: 'modern',
      }

      const mergedTheme = mergeThemeConfig(config)

      expect(mergedTheme.name).toBe('modern')
      expect(mergedTheme.colors.inputBorderFocus).toBe('#10b981')
      expect(mergedTheme.spacing.inputPadding).toBe('2rem')
      expect(mergedTheme.colors.inputBackground).toBe(modernTheme.colors.inputBackground) // Should keep original
    })

    test('should generate theme classes', () => {
      const config = {
        enableAnimations: true,
        enableRoundedCorners: true,
        enableShadows: true,
        theme: 'modern',
      }

      const classes = generateThemeClasses(mergeThemeConfig(config), config)

      expect(classes.container).toContain('position: relative')
      expect(classes.input).toContain('width: 100%')
      expect(classes.results).toContain('position: absolute')
      expect(classes.resultItem).toContain('cursor: pointer')
    })

    test('should detect dark theme correctly', () => {
      expect(isDarkTheme(darkTheme)).toBe(true)
      expect(isDarkTheme(modernTheme)).toBe(false)
      expect(isLightTheme(darkTheme)).toBe(false)
      expect(isLightTheme(modernTheme)).toBe(true)
    })

    test('should handle performance theme configuration', () => {
      const config = {
        enableAnimations: false,
        enableRoundedCorners: false,
        enableShadows: false,
        theme: 'minimal',
      }

      const classes = generateThemeClasses(mergeThemeConfig(config), config)

      expect(classes.input).toContain('transition: none')
      expect(classes.results).toContain('box-shadow: none')
    })
  })

  describe('Theme Integration', () => {
    test('should generate correct CSS styles for modern theme', () => {
      const config: ThemeConfig = {
        enableAnimations: true,
        enableRoundedCorners: true,
        enableShadows: true,
        theme: 'modern',
      }

      const classes = generateThemeClasses(mergeThemeConfig(config), config)

      expect(classes.input).toContain('width: 100%')
      expect(classes.input).toContain('padding: 1rem 1.25rem')
      expect(classes.input).toContain('border-radius: 0.75rem')
      expect(classes.results).toContain('position: absolute')
      expect(classes.resultItem).toContain('cursor: pointer')
    })

    test('should handle performance optimized theme', () => {
      const config: ThemeConfig = {
        enableAnimations: false,
        enableRoundedCorners: false,
        enableShadows: false,
        theme: 'minimal',
      }

      const classes = generateThemeClasses(mergeThemeConfig(config), config)

      expect(classes.input).toContain('transition: none')
      expect(classes.results).toContain('box-shadow: none')
    })

    test('should handle responsive theme configuration', () => {
      const config: ThemeConfig = {
        mobileOptimized: true,
        responsive: true,
        spacing: {
          inputFontSize: '16px', // Prevents zoom on iOS
          resultsMaxHeight: '20rem',
        },
        theme: 'modern',
      }

      const classes = generateThemeClasses(mergeThemeConfig(config), config)

      expect(classes.input).toContain('font-size: 16px')
      expect(classes.results).toContain('max-height: 20rem')
    })
  })

  describe('Theme Validation', () => {
    test('should fallback to default theme for invalid theme name', () => {
      const config = {
        theme: 'invalid-theme',
      }

      const mergedTheme = mergeThemeConfig(config)
      expect(mergedTheme.name).toBe('modern') // Should fallback to default
    })

    test('should handle partial theme overrides', () => {
      const config = {
        colors: {
          inputBorderFocus: '#10b981',
          // Only override one color, others should remain from modern theme
        },
        theme: 'modern',
      }

      const mergedTheme = mergeThemeConfig(config)
      expect(mergedTheme.colors.inputBorderFocus).toBe('#10b981')
      expect(mergedTheme.colors.inputBackground).toBe(modernTheme.colors.inputBackground)
      expect(mergedTheme.colors.inputText).toBe(modernTheme.colors.inputText)
    })
  })
})
