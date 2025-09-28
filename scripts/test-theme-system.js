#!/usr/bin/env node

/**
 * Theme System Test Script
 *
 * This script tests the theme system functionality
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🎨 Testing Theme System...\n')

// Test 1: Check if all theme files exist
const themeFiles = [
  'src/components/themes/types.ts',
  'src/components/themes/themes.ts',
  'src/components/themes/utils.ts',
  'src/components/themes/hooks.ts',
  'src/components/themes/index.ts',
  'src/components/ThemeProvider.tsx',
  'src/components/ThemeExamples.tsx',
]

console.log('📁 Checking theme files...')
themeFiles.forEach((file) => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file} - Missing!`)
    process.exit(1)
  }
})

// Test 2: Check if themes are properly exported
console.log('\n🎨 Checking theme exports...')
try {
  const themesPath = path.join(__dirname, '..', 'src/components/themes/themes.ts')
  const themesContent = fs.readFileSync(themesPath, 'utf8')

  const requiredThemes = [
    'modernTheme',
    'minimalTheme',
    'elegantTheme',
    'darkTheme',
    'colorfulTheme',
  ]
  requiredThemes.forEach((theme) => {
    if (themesContent.includes(theme)) {
      console.log(`  ✅ ${theme}`)
    } else {
      console.log(`  ❌ ${theme} - Not found!`)
      process.exit(1)
    }
  })
} catch (error) {
  console.log(`  ❌ Error reading themes file: ${error.message}`)
  process.exit(1)
}

// Test 3: Check if HeadlessSearchInput has theme prop
console.log('\n🔍 Checking HeadlessSearchInput integration...')
try {
  const componentPath = path.join(__dirname, '..', 'src/components/HeadlessSearchInput.tsx')
  const componentContent = fs.readFileSync(componentPath, 'utf8')

  if (componentContent.includes('theme?: string | ThemeConfig')) {
    console.log('  ✅ Theme prop defined in interface')
  } else {
    console.log('  ❌ Theme prop not found in interface')
    process.exit(1)
  }

  if (componentContent.includes('useThemeConfig')) {
    console.log('  ✅ Theme configuration hook used')
  } else {
    console.log('  ❌ Theme configuration hook not used')
    process.exit(1)
  }

  if (componentContent.includes('themeConfig.theme.colors')) {
    console.log('  ✅ Theme colors applied to styles')
  } else {
    console.log('  ❌ Theme colors not applied to styles')
    process.exit(1)
  }
} catch (error) {
  console.log(`  ❌ Error reading component file: ${error.message}`)
  process.exit(1)
}

// Test 4: Check if documentation exists
console.log('\n📚 Checking documentation...')
const docsPath = path.join(__dirname, '..', 'docs/themes/theme-system.md')
if (fs.existsSync(docsPath)) {
  console.log('  ✅ Theme system documentation exists')
} else {
  console.log('  ❌ Theme system documentation missing')
  process.exit(1)
}

// Test 5: Check if README is updated
console.log('\n📖 Checking README updates...')
try {
  const readmePath = path.join(__dirname, '..', 'README.md')
  const readmeContent = fs.readFileSync(readmePath, 'utf8')

  if (readmeContent.includes('Theme System')) {
    console.log('  ✅ Theme system section in README')
  } else {
    console.log('  ❌ Theme system section missing from README')
    process.exit(1)
  }

  if (readmeContent.includes('theme="modern"')) {
    console.log('  ✅ Theme usage example in README')
  } else {
    console.log('  ❌ Theme usage example missing from README')
    process.exit(1)
  }
} catch (error) {
  console.log(`  ❌ Error reading README: ${error.message}`)
  process.exit(1)
}

console.log('\n🎉 All tests passed! Theme system is ready to use.')
console.log('\n📋 Next steps:')
console.log('  1. Start the development server: npm run dev')
console.log('  2. Visit: http://localhost:3000/theme-test')
console.log('  3. Test different themes and configurations')
console.log('  4. Run the test suite: npm test')
console.log('\n🚀 Happy theming!')
