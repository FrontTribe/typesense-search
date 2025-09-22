# Typesense Search Plugin Tests

This directory contains comprehensive tests for the Typesense Search Plugin for Payload CMS.

## Test Structure

### Unit Tests

- **`search.test.ts`** - Tests for search endpoints and handlers
- **`components.test.tsx`** - Tests for React components (UnifiedSearchInput)
- **`plugin.test.ts`** - Tests for plugin initialization and configuration
- **`utils.test.ts`** - Tests for utility functions (schema mapping)

### Integration Tests

- **`integration.test.ts`** - End-to-end tests with Payload CMS integration

## Running Tests

### All Tests

```bash
pnpm test
```

### Unit Tests Only

```bash
pnpm test:unit
```

### Watch Mode

```bash
pnpm test:watch
```

### Integration Tests

```bash
pnpm test:int
```

### E2E Tests

```bash
pnpm test:e2e
```

## Test Coverage

The tests cover:

### Search Endpoints

- ✅ Collections endpoint (`/api/search/collections`)
- ✅ Universal search (`/api/search`)
- ✅ Collection-specific search (`/api/search/:collectionName`)
- ✅ Advanced search with POST (`/api/search/:collectionName`)
- ✅ Suggest endpoint (`/api/search/:collectionName/suggest`)
- ✅ Error handling for all endpoints
- ✅ Parameter validation
- ✅ Route registration

### React Components

- ✅ UnifiedSearchInput component rendering
- ✅ Search functionality
- ✅ Result display and interaction
- ✅ Error handling
- ✅ Loading states
- ✅ Custom rendering functions
- ✅ Event callbacks
- ✅ Keyboard navigation
- ✅ Click outside behavior

### Plugin Functionality

- ✅ Plugin initialization
- ✅ Configuration handling
- ✅ Endpoint registration
- ✅ Hook registration
- ✅ Collection filtering
- ✅ Error handling
- ✅ Disabled plugin behavior

### Utility Functions

- ✅ Schema mapping for different field types
- ✅ RichText field processing
- ✅ Array field handling
- ✅ Nested object processing
- ✅ Date field conversion
- ✅ Boolean field conversion
- ✅ Null/undefined handling
- ✅ Complex nested structures

### Integration

- ✅ Payload CMS integration
- ✅ Document creation and sync
- ✅ Document update and sync
- ✅ Document deletion and sync
- ✅ Multiple collection support
- ✅ Error handling in real scenarios

## Mocking

The tests use comprehensive mocking:

- **Typesense Client** - Mocked to avoid external dependencies
- **Payload CMS** - Mocked for integration tests
- **Fetch API** - Mocked for component tests
- **React Testing Library** - Used for component testing
- **Vitest** - Test runner with jsdom environment

## Test Data

Tests use realistic test data that matches the plugin's expected data structures:

- Sample documents with various field types
- RichText content with proper structure
- Array fields with nested objects
- Date fields and timestamps
- Boolean and number fields
- Complex nested structures

## Best Practices

1. **Isolation** - Each test is independent and doesn't affect others
2. **Mocking** - External dependencies are properly mocked
3. **Coverage** - All major functionality is covered
4. **Realistic Data** - Test data matches real-world usage
5. **Error Scenarios** - Both success and failure cases are tested
6. **Performance** - Tests run quickly with proper timeouts
7. **Maintainability** - Tests are well-organized and documented

## Adding New Tests

When adding new functionality:

1. Add unit tests for new functions/components
2. Add integration tests for new endpoints
3. Update existing tests if behavior changes
4. Ensure all error cases are covered
5. Add tests for edge cases
6. Update this documentation

## Debugging Tests

To debug failing tests:

1. Run specific test file: `pnpm test:unit search.test.ts`
2. Use `console.log` in tests (mocked in setup)
3. Check mock implementations
4. Verify test data structure
5. Check async/await handling
6. Verify timeouts and delays
