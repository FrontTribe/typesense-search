# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.9](https://github.com/fronttribe/typesense-search/compare/v1.0.8...v1.0.9) (2025-09-24)


### Bug Fixes

* resolve duplicate asset names in GitHub release uploads ([606dc63](https://github.com/fronttribe/typesense-search/commit/606dc63b94eddb7e703ecc87b331950d7e85219b))

## [1.0.8](https://github.com/fronttribe/typesense-search/compare/v1.0.7...v1.0.8) (2025-09-24)


### Bug Fixes

* add missing conventional-changelog-conventionalcommits dependency ([4a70ff5](https://github.com/fronttribe/typesense-search/commit/4a70ff58714d344496cdec48f92955139d25532e))
* consolidate GitHub Actions workflows and update lockfile ([22a47d0](https://github.com/fronttribe/typesense-search/commit/22a47d0ee3dfa9ff3fe5499aa5028db26eddd546))
* disable E2E tests in GitHub Actions ([b819762](https://github.com/fronttribe/typesense-search/commit/b8197623232db15d5ba18ccb26c37e01830dc708))
* force conventional-changelog-writer v6.0.0 to resolve timestamp issue ([07265a2](https://github.com/fronttribe/typesense-search/commit/07265a2d3082b5b75098b568af9bc97d5f13029d))
* improve search parameter parsing to prevent NaN errors ([c5fac29](https://github.com/fronttribe/typesense-search/commit/c5fac29a0f7c02121a122c79898303102acb9ceb))
* lint issues and improvements ([b34710e](https://github.com/fronttribe/typesense-search/commit/b34710edc1866a87a87508ca32a793afa9d74a34))
* remove npm cache from Node.js setup in GitHub Actions ([97d02f5](https://github.com/fronttribe/typesense-search/commit/97d02f528c961587b8397e12a77ca4c5e49a79fc))
* removed pnpm lock ([cdf14c5](https://github.com/fronttribe/typesense-search/commit/cdf14c5319d9aa73491e18dbc019014fe1799ee0))
* resolve all test issues and GitHub Actions problems ([2966748](https://github.com/fronttribe/typesense-search/commit/2966748221a646325c11bdbd1684cd09d91451eb))
* resolve GitHub Actions and test issues ([0adcef9](https://github.com/fronttribe/typesense-search/commit/0adcef98d34e709d3f278e74b4a50e4903df8d69))
* resolve NPM token authentication issue in CI ([e0490ae](https://github.com/fronttribe/typesense-search/commit/e0490ae1185fe8af651446e18d4edda2e607727f))
* resolve pnpm version conflict in GitHub Actions ([073c0a6](https://github.com/fronttribe/typesense-search/commit/073c0a64ba3588e94be62fe5275493b2a617ff13))
* resolve release notes generation timestamp issue ([0ec5ce2](https://github.com/fronttribe/typesense-search/commit/0ec5ce21465404c8e168315c69f317889e2105b2))
* resolve search functionality and improve code quality ([7a14474](https://github.com/fronttribe/typesense-search/commit/7a1447449e2d230469eb067dcddb9d26c5b2f9c8))
* resolve security audit and linting issues ([dc2d3d4](https://github.com/fronttribe/typesense-search/commit/dc2d3d42213bfe8bbe52d4a318efdf935577cbb8))
* resolve TypeScript build errors ([aba59d1](https://github.com/fronttribe/typesense-search/commit/aba59d19b0ad8b618a25622a136ddb845351c4cd))
* resolve Typesense container initialization in GitHub Actions ([a4ad8d2](https://github.com/fronttribe/typesense-search/commit/a4ad8d206d56fde1e64e9d1a48ddfbe39791c491))
* specify src path in lint script to prevent linting dist folder ([57c720f](https://github.com/fronttribe/typesense-search/commit/57c720fa8be689467f0e635b7dde5f5375026de4))
* update GitHub Actions workflows to use pnpm instead of npm cache ([ebd2db0](https://github.com/fronttribe/typesense-search/commit/ebd2db023fb14ac96cdb3a1770c47237aa70a920))
* update pnpm lockfile to match overrides configuration ([87e7653](https://github.com/fronttribe/typesense-search/commit/87e765322537ec753e01341f5d2dec4401dde9cd))
* update test configuration to exclude problematic E2E tests ([a210e66](https://github.com/fronttribe/typesense-search/commit/a210e66e063bdd859a3ba7acff9719b17eebeb3f))

## [1.0.0] - 2024-01-XX

### Added

- Initial release of Typesense Search Plugin for Payload CMS by Front Tribe
- Real-time synchronization between Payload CMS and Typesense
- Support for create, update, and delete operations
- RichText field content extraction and indexing
- RESTful API endpoints for search operations
- Headless search component for frontend integration
- TypeScript support with comprehensive type definitions
- Docker Compose configuration for easy Typesense setup
- Faceted search support with filtering capabilities
- Typo tolerance and fuzzy matching
- Responsive design for all screen sizes
- Error handling and graceful fallbacks
- Auto-creation of Typesense collections
- Search suggestions and autocomplete
- Performance optimization and caching
- Comprehensive documentation and examples
- **Universal Search**: Search across all collections simultaneously
- **Collection Categorization**: Rich metadata with icons and display names
- **Plug & Play Setup**: Zero-configuration endpoint registration
- **Enhanced Error Handling**: Comprehensive error handling and user feedback
- **Improved TypeScript Support**: Better type definitions and interfaces

### Features

- **Search API**: Complete search endpoints with query parameters
- **Real-time Sync**: Automatic synchronization on data changes
- **RichText Support**: Proper extraction of text content from richText fields
- **Admin Interface**: Built-in search interface in Payload admin panel
- **Headless Component**: Reusable search component for any frontend
- **TypeScript**: Full TypeScript support with type definitions
- **Docker**: Easy setup with Docker Compose
- **Performance**: Sub-millisecond search response times
- **Error Handling**: Graceful handling of edge cases and errors
- **Auto-Sync**: Automatic collection creation and schema management

### Technical Details

- Built for Payload CMS 3.x
- Compatible with Typesense 0.25+
- Requires Node.js 22.19.0+
- Uses pnpm as the recommended package manager
- Supports both CommonJS and ES modules
- Includes comprehensive error handling
- Auto-creates missing collections
- Handles richText field extraction
- Supports faceted search and filtering
- Includes search suggestions and autocomplete

### Fixed

- **TypeScript Errors**: Fixed error type handling and variable scope issues
- **Parameter Extraction**: Improved search parameter extraction from Payload CMS requests
- **Collection Categorization**: Fixed "Unknown Collection" issue in search results
- **React Component Errors**: Resolved `charAt` errors in search result rendering
- **Endpoint Routing**: Fixed route conflicts and precedence issues
- **Server Hot-Reload**: Resolved compilation issues preventing code updates
- **Error Handling**: Enhanced error handling throughout the search pipeline

### Changed

- **Admin Interface**: Removed configuration error alerts and statistics displays
- **Search Component**: Updated to use universal search endpoint by default
- **Collection Metadata**: Improved collection information extraction and display
- **Error Callbacks**: Added `onError` prop for better error handling
- **API Endpoints**: Reordered routes to prevent conflicts
- **Documentation**: Updated with latest features and troubleshooting guides

### Breaking Changes

- None (initial release)

### Migration Guide

- N/A (initial release)

## [0.1.0] - 2024-01-XX (Pre-release)

### Added

- Initial development version
- Basic search functionality
- Payload CMS integration
- Typesense client setup
- Basic admin interface
- Search API endpoints

### Fixed

- RichText field processing
- Error handling for missing collections
- Sync operations for create/update/delete
- Search performance optimization
- TypeScript type definitions

### Changed

- Improved error handling
- Enhanced admin interface
- Better documentation
- Performance optimizations
- Code refactoring and cleanup

---

## Version History

- **v1.0.0**: Initial stable release with full feature set
- **v0.1.0**: Pre-release development version

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
