# Branch Protection Setup

This repository uses branch protection rules to ensure code quality and prevent accidental changes to the main branch.

> 📖 **New to GitHub Apps?** See [GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md) for detailed step-by-step instructions on creating and configuring a GitHub App.

## Automated Setup

You can set up branch protection automatically using the provided script. We recommend using **GitHub Apps** for better security and fine-grained permissions.

### Option 1: GitHub App (Recommended)

GitHub Apps provide:

- ✅ Fine-grained permissions (only what's needed)
- ✅ Better security (scoped to specific repositories)
- ✅ Better audit trail
- ✅ No personal token exposure

#### Setting up a GitHub App

1. Go to your GitHub App settings:
   - **Personal account**: https://github.com/settings/apps
   - **Organization**: https://github.com/organizations/YOUR-ORG-NAME/settings/apps
2. Click **"New GitHub App"**
3. Configure the app:
   - **Name**: `Stashtab Branch Protection`
   - **Homepage URL**: Your repository URL
   - **Callback URL**: Can be empty for this use case
4. Set **Repository permissions**:
   - **Administration**: Read & write (required for branch protection)
   - **Metadata**: Read-only (always enabled)
5. Click **"Create GitHub App"**
6. **Generate a private key** and save it securely
7. **Install the app** on your repository:
   - Go to the app settings
   - Click **"Install App"**
   - Select your repository
   - Click **"Install"**
8. Note your **App ID** (shown on the app settings page)

#### Using the GitHub App

```bash
GITHUB_APP_ID=123456 \
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..." \
pnpm setup:branch-protection
```

**Note**: The private key can include `\n` characters in the environment variable. The script will automatically handle them. You can also use a multi-line string:

```bash
export GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----"
```

The script will automatically:

1. Generate a JWT using your App ID and private key
2. Find the installation for your repository
3. Exchange the JWT for an installation access token
4. Use the token to configure branch protection

### Option 2: Personal Access Token

```bash
GITHUB_TOKEN=your_token pnpm setup:branch-protection
```

Or using tsx directly:

```bash
GITHUB_TOKEN=your_token tsx scripts/setup-branch-protection.ts
```

#### Creating a Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a descriptive name (e.g., "Stashtab Branch Protection Setup")
4. Select the `repo` scope (Full control of private repositories)
5. Click **"Generate token"**
6. Copy the token and use it as the `GITHUB_TOKEN` environment variable

**Security Note**: Personal Access Tokens have broad permissions. Consider using GitHub Apps for better security.

## Manual Setup

If you prefer to set up branch protection manually:

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Branches**
3. Under "Branch protection rules", click **Add rule** or edit the existing rule for `main`
4. Configure the following settings:

### Branch Protection Settings

- **Branch name pattern**: `main`
- **Require a pull request before merging**:
  - ✅ Require approvals: `1`
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners: (optional)
- **Require status checks to pass before merging**:
  - ✅ Require branches to be up to date before merging
  - Select the following required status checks:
    - `CI / Build`
    - `CI / Lint`
    - `CI / Test`
    - `CI / Type Check`

**Important**: Status checks will only appear in the dropdown after they have run successfully. GitHub sometimes requires checks to run on a **pull request** (not just pushes) before they appear. If you don't see the checks:

1. **Create a test pull request** targeting `main`:
   - Create a new branch: `git checkout -b test/trigger-checks`
   - Make a small change (e.g., add a comment)
   - Push and create a PR: `git push origin test/trigger-checks`
   - Wait for all CI checks to pass on the PR
   - The checks should now appear in branch protection settings

2. **Alternative**: Wait for the next PR to be created - checks will appear after they run successfully

3. **If checks still don't appear**:
   - Wait 5-10 minutes (GitHub can take time to update)
   - Refresh the branch protection settings page
   - Check that the workflow file is in `.github/workflows/ci.yml`
   - Verify the workflow has run successfully in the Actions tab

- **Require conversation resolution before merging**: ✅ Enabled
- **Do not allow bypassing the above settings**: ✅ Enabled (enforce for administrators)
- **Restrict who can push to matching branches**: (optional, leave empty to allow all collaborators)
- **Allow force pushes**: ❌ Disabled
- **Allow deletions**: ❌ Disabled

### Merge Options

- ✅ Allow squash merging
- ✅ Allow merge commits
- ✅ Allow rebase merging
- ❌ Allow auto-merge: (optional)

## Current Protection Rules

The main branch is protected with the following rules:

- ✅ All status checks must pass before merging
- ✅ At least 1 approval required for pull requests
- ✅ Stale approvals are dismissed on new commits
- ✅ Conversation resolution required
- ✅ Administrators are also subject to these rules
- ❌ Force pushes are not allowed
- ❌ Branch deletion is not allowed

## Required Status Checks

The following CI checks must pass before merging:

- **CI / Build (push)** - Ensures all packages build successfully
- **CI / Lint (push)** - Ensures code follows linting rules
- **CI / Test (push)** - Ensures all tests pass
- **CI / Type Check (push)** - Ensures TypeScript types are correct

## Troubleshooting

### "Status checks must pass" but checks aren't showing

If the required status checks don't appear in the dropdown:

1. Make sure the CI workflow has run at least once on the main branch
2. Wait a few minutes for GitHub to update the available checks
3. Try refreshing the branch protection settings page

### Can't push to main branch

If you're unable to push directly to main:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit
3. Push the branch: `git push origin feature/your-feature`
4. Create a pull request on GitHub
5. Wait for CI checks to pass
6. Get approval from a reviewer
7. Merge the pull request

### Bypassing protection (not recommended)

If you absolutely need to bypass protection (e.g., for hotfixes), you can:

1. Temporarily disable branch protection in settings
2. Make your changes
3. Re-enable branch protection immediately

**Note**: This should only be done in emergencies and with proper authorization.
