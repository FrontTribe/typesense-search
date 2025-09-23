# Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to automate versioning and changelog generation.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

| Type       | Description                                                   | Version Bump |
| ---------- | ------------------------------------------------------------- | ------------ |
| `feat`     | A new feature                                                 | Minor        |
| `fix`      | A bug fix                                                     | Patch        |
| `docs`     | Documentation only changes                                    | -            |
| `style`    | Changes that do not affect the meaning of the code            | -            |
| `refactor` | A code change that neither fixes a bug nor adds a feature     | -            |
| `perf`     | A code change that improves performance                       | Patch        |
| `test`     | Adding missing tests or correcting existing tests             | -            |
| `build`    | Changes that affect the build system or external dependencies | -            |
| `ci`       | Changes to our CI configuration files and scripts             | -            |
| `chore`    | Other changes that don't modify src or test files             | -            |
| `revert`   | Reverts a previous commit                                     | Patch        |

## Breaking Changes

To indicate a breaking change, add `!` after the type/scope, or include `BREAKING CHANGE:` in the footer.

**Examples:**

```bash
feat!: remove deprecated API
feat(api)!: remove deprecated API
feat: add new API

BREAKING CHANGE: The old API is no longer supported
```

## Examples

### Good Commit Messages

```bash
feat: add vector search support
fix: resolve search timeout issue
docs: update installation guide
feat(search): add faceting capabilities
fix(api): handle empty search results
chore: update dependencies
feat!: change API response format

BREAKING CHANGE: API response format has changed
```

### Bad Commit Messages

```bash
update stuff
fix
WIP
asdf
feat: Add feature (missing scope, inconsistent capitalization)
```

## Scope (Optional)

Use scope to indicate the area of the codebase affected:

- `api` - API endpoints
- `search` - Search functionality
- `ui` - User interface components
- `config` - Configuration
- `deps` - Dependencies
- `docs` - Documentation
- `tests` - Tests

## Body (Optional)

Use the body to explain **what** and **why**, not **how**:

```bash
feat: add vector search support

Vector search allows users to find similar content using embeddings.
This enables semantic search capabilities beyond keyword matching.

Closes #123
```

## Footer (Optional)

Use footer for:

- Breaking changes: `BREAKING CHANGE: <description>`
- Issue references: `Closes #123`, `Fixes #456`
- Co-authors: `Co-authored-by: Name <email>`

## Automated Release Process

When you push to `main` with conventional commits:

1. **Semantic Release** analyzes your commits
2. **Version** is bumped automatically (patch/minor/major)
3. **Changelog** is generated and updated
4. **NPM package** is published automatically
5. **GitHub release** is created with release notes

## Pre-release Branches

- `beta` - Creates beta releases (e.g., `1.1.0-beta.1`)
- `alpha` - Creates alpha releases (e.g., `1.1.0-alpha.1`)

## Testing Your Commits

Before pushing, test your commit messages:

```bash
# Dry run to see what would be released
pnpm release:dry-run
```

## Quick Reference

| Want to...          | Use commit type   | Example                             |
| ------------------- | ----------------- | ----------------------------------- |
| Add a new feature   | `feat`            | `feat: add search suggestions`      |
| Fix a bug           | `fix`             | `fix: resolve search timeout`       |
| Update docs         | `docs`            | `docs: update API reference`        |
| Refactor code       | `refactor`        | `refactor: simplify search logic`   |
| Improve performance | `perf`            | `perf: optimize search queries`     |
| Add tests           | `test`            | `test: add search component tests`  |
| Breaking change     | `feat!` or `fix!` | `feat!: change API response format` |

## Need Help?

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
