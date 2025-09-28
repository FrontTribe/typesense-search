/**
 * Theme Examples for HeadlessSearchInput
 *
 * This file demonstrates how to use the theme system with different configurations
 */

import React from 'react'

import type { ThemeConfig } from './themes/types.js'

import { HeadlessSearchInput } from './HeadlessSearchInput.js'

// Example 1: Simple theme selection
export function SimpleThemeExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Simple Theme Examples</h2>

      {/* Modern theme (default) */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Modern Theme (Default)</h3>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          placeholder="Search with modern theme..."
          theme="modern"
        />
      </div>

      {/* Minimal theme */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Minimal Theme</h3>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          placeholder="Search with minimal theme..."
          theme="minimal"
        />
      </div>

      {/* Elegant theme */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Elegant Theme</h3>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          placeholder="Search with elegant theme..."
          theme="elegant"
        />
      </div>

      {/* Dark theme */}
      <div
        style={{
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          marginBottom: '20px',
          padding: '20px',
        }}
      >
        <h3 style={{ color: '#f9fafb' }}>Dark Theme</h3>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          placeholder="Search with dark theme..."
          theme="dark"
        />
      </div>

      {/* Colorful theme */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Colorful Theme</h3>
        <HeadlessSearchInput
          baseUrl="http://localhost:3000"
          placeholder="Search with colorful theme..."
          theme="colorful"
        />
      </div>
    </div>
  )
}

// Example 2: Custom theme configuration
export function CustomThemeExample() {
  const customTheme: ThemeConfig = {
    colors: {
      collectionBadge: '#ddd6fe',
      collectionBadgeText: '#6d28d9',
      descriptionText: '#6b7280',
      errorBackground: '#fef2f2',
      errorText: '#dc2626',
      facetActiveBackground: '#ec4899',
      facetActiveText: '#ffffff',
      facetBackground: '#fdf2f8',
      facetBorder: '#f3e8ff',
      facetText: '#be185d',
      headerBackground: '#fdf2f8',
      headerText: '#be185d',
      highlightBackground: '#fef3c7',
      highlightText: '#92400e',
      inputBackground: '#ffffff',
      inputBorder: '#e879f9',
      inputBorderFocus: '#ec4899',
      inputPlaceholder: '#a855f7',
      inputText: '#1f2937',
      loadingText: '#a855f7',
      metaText: '#a855f7',
      noResultsText: '#a855f7',
      resultBackground: '#ffffff',
      resultBackgroundFocus: '#fef3c7',
      resultBackgroundHover: '#fdf2f8',
      resultBorder: '#f3e8ff',
      resultsBackground: '#ffffff',
      resultsBorder: '#e879f9',
      scoreBadge: '#fecaca',
      scoreBadgeText: '#dc2626',
      titleText: '#1f2937',
    },
    spacing: {
      headerFontSize: '0.875rem',
      headerPadding: '1rem 1.5rem',
      inputBorderRadius: '1.5rem',
      inputFontSize: '1.125rem',
      inputPadding: '1rem 1.25rem',
      itemBorderRadius: '0',
      itemMargin: '0',
      itemPadding: '1.25rem 1.5rem',
      metaFontSize: '0.75rem',
      metaPadding: '0.5rem 0',
      resultsBorderRadius: '0 0 1.5rem 1.5rem',
      resultsMaxHeight: '28rem',
      resultsPadding: '0',
    },
    theme: 'modern',
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Custom Theme Configuration</h2>
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        placeholder="Search with custom theme..."
        showResultCount={true}
        showSearchTime={true}
        theme={customTheme}
      />
    </div>
  )
}

// Example 3: Theme with custom overrides
export function OverrideThemeExample() {
  const overrideTheme: ThemeConfig = {
    colors: {
      inputBackground: '#f0fdf4', // Light green background
      inputBorderFocus: '#10b981', // Green focus instead of default
      resultsBackground: '#f0fdf4',
    },
    enableAnimations: true,
    enableRoundedCorners: true,
    enableShadows: true,
    spacing: {
      inputBorderRadius: '2rem', // More rounded
      inputPadding: '1.5rem 2rem', // More padding
    },
    theme: 'minimal',
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Theme with Custom Overrides</h2>
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="products"
        placeholder="Search with overridden theme..."
        theme={overrideTheme}
      />
    </div>
  )
}

// Example 4: Responsive theme
export function ResponsiveThemeExample() {
  const responsiveTheme: ThemeConfig = {
    animations: {
      transitionFast: '0s', // Disable animations on mobile
      transitionNormal: '0s',
      transitionSlow: '0s',
    },
    mobileOptimized: true,
    responsive: true,
    spacing: {
      inputFontSize: '16px', // Prevents zoom on iOS
      inputPadding: '0.875rem 1rem',
      resultsMaxHeight: '20rem', // Smaller on mobile
    },
    theme: 'modern',
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Responsive Theme</h2>
      <p>This theme adapts to mobile devices for better performance</p>
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        placeholder="Search with responsive theme..."
        theme={responsiveTheme}
      />
    </div>
  )
}

// Example 5: Dark mode with system preference
export function SystemThemeExample() {
  const systemTheme: ThemeConfig = {
    colors: {
      // Will be overridden based on system preference
      inputBackground: 'var(--system-bg, #ffffff)',
      inputText: 'var(--system-text, #111827)',
      resultsBackground: 'var(--system-bg, #ffffff)',
      titleText: 'var(--system-text, #111827)',
    },
    theme: 'modern',
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>System Theme Integration</h2>
      <p>This theme respects system dark/light mode preferences</p>
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        placeholder="Search with system theme..."
        theme={systemTheme}
      />
    </div>
  )
}

// Example 6: Performance optimized theme
export function PerformanceThemeExample() {
  const performanceTheme: ThemeConfig = {
    enableAnimations: false,
    enableRoundedCorners: false,
    enableShadows: false,
    spacing: {
      inputBorderRadius: '0',
      inputPadding: '0.75rem 1rem',
      itemPadding: '0.75rem 1rem',
      resultsBorderRadius: '0',
    },
    theme: 'minimal',
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Performance Optimized Theme</h2>
      <p>This theme prioritizes performance with minimal styling</p>
      <HeadlessSearchInput
        baseUrl="http://localhost:3000"
        collection="posts"
        placeholder="Search with performance theme..."
        theme={performanceTheme}
      />
    </div>
  )
}

// Example 7: Complete theme showcase
export function ThemeShowcase() {
  const themes = ['modern', 'minimal', 'elegant', 'dark', 'colorful']

  return (
    <div style={{ padding: '20px' }}>
      <h1>Typesense Search Theme Showcase</h1>
      <p>Explore all available themes for the HeadlessSearchInput component</p>

      {themes.map((theme) => (
        <div
          key={theme}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '40px',
            padding: '20px',
          }}
        >
          <h2 style={{ marginBottom: '20px', textTransform: 'capitalize' }}>{theme} Theme</h2>
          <HeadlessSearchInput
            baseUrl="http://localhost:3000"
            collection="posts"
            placeholder={`Search with ${theme} theme...`}
            showResultCount={true}
            showSearchTime={true}
            theme={theme as any}
          />
        </div>
      ))}
    </div>
  )
}

// Export all examples
export default {
  CustomThemeExample,
  OverrideThemeExample,
  PerformanceThemeExample,
  ResponsiveThemeExample,
  SimpleThemeExample,
  SystemThemeExample,
  ThemeShowcase,
}
