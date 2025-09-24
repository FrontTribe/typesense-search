# Contributing to Typesense Search Plugin

Thank you for your interest in contributing to the Typesense Search Plugin for Payload CMS! We welcome contributions from the community and are grateful for your help in making this plugin better.

## 🚀 Getting Started

### Prerequisites

- Node.js 22.19.0 or higher
- pnpm (recommended package manager)
- Docker and Docker Compose
- Git

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/fronttribe/typesense-search.git
   cd typesense-search
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Start Typesense**:

   ```bash
   docker-compose up -d
   ```

5. **Start the development server**:
   ```bash
   cd dev
   pnpm dev
   ```

## 🛠️ Development Workflow

### Making Changes

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit your changes** with a clear commit message

### Coding Standards

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic
- **Error Handling**: Include proper error handling

### Testing

Before submitting a pull request, please ensure:

- [ ] All existing tests pass
- [ ] New tests are added for new functionality
- [ ] Integration tests pass
- [ ] Manual testing is completed
- [ ] No linting errors

```bash
# Run tests
pnpm test

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## 📝 Pull Request Process

### Before Submitting

1. **Update documentation** for any new features
2. **Add tests** for new functionality
3. **Update CHANGELOG.md** with your changes
4. **Ensure all tests pass**
5. **Rebase** your branch on the latest main branch

### Pull Request Template

When creating a pull request, please include:

- **Description**: Clear description of what the PR does
- **Type**: Bug fix, feature, documentation, etc.
- **Breaking Changes**: List any breaking changes
- **Testing**: How you tested the changes
- **Screenshots**: If applicable, include screenshots

### Review Process

- All PRs require review from maintainers
- Address feedback promptly
- Keep PRs focused and atomic
- Respond to review comments

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: Node.js version, OS, etc.
- **Screenshots**: If applicable

### Feature Requests

For feature requests, please include:

- **Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Proposed Solution**: Your ideas for implementation
- **Alternatives**: Any alternative solutions considered

## 📚 Documentation

### Code Documentation

- Use JSDoc comments for functions and classes
- Include examples in documentation
- Keep README.md updated
- Update API documentation for new endpoints

### README Updates

When adding new features:

- Update the Features section
- Add usage examples
- Update configuration options
- Include migration guides if needed

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Update README.md if needed
- [ ] Run full test suite
- [ ] Build the project
- [ ] Create release notes
- [ ] Publish to npm

### Pre-release Process

We support pre-release versions for testing new features before stable releases:

#### Creating Pre-releases

**Beta Releases** (for testing stable features):

```bash
# Create a beta branch
git checkout -b beta

# Make your changes and commit with conventional commits
git commit -m "feat: add new search feature"

# Push to beta branch - this triggers beta release
git push origin beta
```

**Alpha Releases** (for experimental features):

```bash
# Create an alpha branch
git checkout -b alpha

# Make your changes and commit with conventional commits
git commit -m "feat: experimental vector search"

# Push to alpha branch - this triggers alpha release
git push origin alpha
```

#### Pre-release Versioning

- **Beta releases**: `1.1.0-beta.1`, `1.1.0-beta.2`, etc.
- **Alpha releases**: `1.1.0-alpha.1`, `1.1.0-alpha.2`, etc.

#### Installing Pre-releases

```bash
# Install beta version
pnpm add typesense-search-plugin@beta

# Install alpha version
pnpm add typesense-search-plugin@alpha

# Install specific pre-release version
pnpm add typesense-search-plugin@1.1.0-beta.1
```

#### Promoting Pre-releases

When a pre-release is ready for stable release:

1. **Merge to main branch**:

   ```bash
   git checkout main
   git merge beta
   git push origin main
   ```

2. **The stable version will be automatically released** based on the commits

#### Pre-release Guidelines

- **Beta releases** should be feature-complete and tested
- **Alpha releases** can contain experimental or incomplete features
- **Document breaking changes** in pre-release commit messages
- **Test pre-releases** in development environments before production use
- **Provide feedback** on pre-releases through GitHub issues

#### Pre-release Testing

Before creating a pre-release:

```bash
# Run full test suite
pnpm test

# Build and analyze bundle
pnpm build
pnpm analyze

# Test in development environment
cd dev
pnpm dev
```

#### Pre-release Communication

- **Announce pre-releases** in GitHub Discussions
- **Document new features** in pre-release notes
- **Request feedback** from the community
- **Monitor issues** and feedback during pre-release period

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

### Communication

- Use clear and concise language
- Be patient with questions
- Provide helpful responses
- Share knowledge and experience

## 📞 Getting Help

### Resources

- **Documentation**: Check the README.md and wiki
- **Issues**: Search existing issues first
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord (if available)

### Questions

If you have questions:

1. Check the documentation first
2. Search existing issues and discussions
3. Create a new issue with the "question" label
4. Join our community discussions

## 🎉 Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community acknowledgments

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Typesense Search Plugin! Your contributions help make this project better for everyone. 🚀
