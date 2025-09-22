# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added

- Initial release of Typesense Search Plugin for Payload CMS by Front Tribe
- Real-time synchronization between Payload CMS and Typesense
- Support for create, update, and delete operations
- RichText field content extraction and indexing
- Beautiful admin interface with search functionality
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
