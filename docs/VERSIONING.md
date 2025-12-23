# Versioning Strategy

Stashtab follows [Semantic Versioning](https://semver.org/) (SemVer) for all releases.

## Version Format

Version numbers follow the pattern: `MAJOR.MINOR.PATCH`

- **MAJOR** (X.0.0): Breaking changes that require migration
- **MINOR** (0.X.0): New features, backward compatible
- **PATCH** (0.0.X): Bug fixes, backward compatible

## Release Types

### Major Releases (X.0.0)

Major releases include breaking changes that may require:

- Database migrations
- Configuration changes
- API changes
- SDK changes

**Examples:**

- Changing database schema
- Removing deprecated APIs
- Changing authentication flow
- Major architecture changes

### Minor Releases (0.X.0)

Minor releases add new features while maintaining backward compatibility:

- New integrations
- New API endpoints
- New SDK features
- New configuration options

**Examples:**

- Adding new KYC provider
- Adding new notification channel
- Adding new admin features
- New mobile app features

### Patch Releases (0.0.X)

Patch releases fix bugs and issues:

- Bug fixes
- Security patches
- Performance improvements
- Documentation updates

**Examples:**

- Fixing transaction bugs
- Fixing authentication issues
- Performance optimizations
- Documentation corrections

## Pre-Release Versions

### Alpha (0.1.0-alpha.1)

Early development versions, may be unstable.

### Beta (0.1.0-beta.1)

Feature-complete but may have bugs. Suitable for testing.

### Release Candidate (0.1.0-rc.1)

Final testing before release. Should be stable.

## Release Process

1. **Development**: Work happens on `main` branch
2. **Version Bump**: Update version in `package.json` and `CHANGELOG.md`
3. **Tag Release**: Create git tag (e.g., `v0.1.0`)
4. **Release Notes**: Update CHANGELOG with release notes
5. **GitHub Release**: Create GitHub release with notes
6. **Deploy**: Automated deployment via GitHub Actions

## Migration Guides

For major releases, migration guides are provided in:

- `docs/MIGRATION.md` - General migration guide
- `docs/UPGRADING.md` - Upgrade instructions
- Release notes in CHANGELOG.md

## Deprecation Policy

1. **Deprecation Notice**: Features are marked as deprecated in one minor release
2. **Removal**: Deprecated features are removed in the next major release
3. **Migration Path**: Clear migration path is provided

## Version Compatibility

### API Versioning

API versions are specified via:

- URL path: `/v1/`, `/v2/`, etc.
- Header: `API-Version: 1.0`

### SDK Versioning

SDK follows npm semantic versioning:

- `^0.1.0` - Compatible with 0.1.x
- `~0.1.0` - Compatible with 0.1.0 only

## Current Version

**Current**: `0.1.0` (Initial release)

**Next Planned**:

- `0.2.0` - Multi-chain support, advanced features
- `1.0.0` - Production-ready, stable API

## Support Policy

- **Current Version**: Full support
- **Previous Minor Version**: Security patches only
- **Older Versions**: No support

## Questions?

For version-related questions, see:

- [CHANGELOG.md](../CHANGELOG.md) - Version history
- [MIGRATION.md](./MIGRATION.md) - Migration guides
- [UPGRADING.md](./UPGRADING.md) - Upgrade instructions
