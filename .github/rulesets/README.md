# Branch Protection Rulesets

This directory contains branch protection ruleset definitions for the repository.

## Files

- `main-branch-protection.json` - Branch protection rules for the `main` branch

## Usage

These rulesets can be applied using:

1. **GitHub API** - Use the Repository Rulesets API (v2) to create rulesets programmatically
2. **GitHub UI** - Manually configure in Settings → Branches → Branch protection rules
3. **Setup Script** - Run `pnpm setup:branch-protection` to apply via the legacy branch protection API

## Ruleset Configuration

The ruleset includes:

### Pull Request Requirements

- ✅ Require 1 approving review
- ✅ Dismiss stale reviews on new commits
- ✅ Require conversation resolution

### Status Checks

- ✅ Require all status checks to pass:
  - `CI / Build`
  - `CI / Lint`
  - `CI / Test`
  - `CI / Type Check`
- ✅ Require branches to be up to date

### Branch Protection

- ✅ Block force pushes
- ✅ Block branch deletion
- ✅ Require linear history
- ✅ Require signed commits
- ✅ Enforce for administrators

### Merge Options

- ✅ Allow squash merge
- ✅ Allow merge commit
- ✅ Allow rebase merge

## Applying Rulesets via API

To apply using the GitHub API:

```bash
# Using the setup script (uses legacy branch protection API)
GITHUB_TOKEN=your_token pnpm setup:branch-protection

# Or using the Repository Rulesets API directly
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/rulesets \
  -d @.github/rulesets/main-branch-protection.json
```

## Note

GitHub's Repository Rulesets API (v2) is newer and more flexible than the legacy branch protection API. However, the setup script currently uses the legacy API for broader compatibility.
