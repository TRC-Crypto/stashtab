#!/usr/bin/env tsx
/**
 * Setup Branch Protection for main branch
 *
 * This script configures branch protection rules for the main branch using the GitHub API.
 *
 * Authentication Options:
 *   1. GitHub App (Recommended - more secure, fine-grained permissions)
 *      GITHUB_APP_ID=123456 GITHUB_APP_PRIVATE_KEY="..." tsx scripts/setup-branch-protection.ts
 *
 *   2. Personal Access Token (PAT)
 *      GITHUB_TOKEN=your_token tsx scripts/setup-branch-protection.ts
 *
 * GitHub App Setup:
 *   1. Go to https://github.com/organizations/TRC-Crypto/settings/apps
 *   2. Click "New GitHub App"
 *   3. Set name, homepage, and callback URL
 *   4. Permissions needed:
 *      - Repository permissions → Administration: Read & write
 *      - Repository permissions → Metadata: Read-only
 *   5. Install the app on your repository
 *   6. Get the App ID and generate a private key
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY;
const REPO_OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'TRC-Crypto';
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'stashtab';
const BRANCH = 'main';
const API_BASE = 'https://api.github.com';

// Validate authentication
if (!GITHUB_TOKEN && (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY)) {
  console.error('❌ Authentication required');
  console.error('');
  console.error('Option 1: GitHub App (Recommended)');
  console.error(
    '  GITHUB_APP_ID=123456 GITHUB_APP_PRIVATE_KEY="..." tsx scripts/setup-branch-protection.ts'
  );
  console.error('');
  console.error('Option 2: Personal Access Token');
  console.error('  GITHUB_TOKEN=your_token tsx scripts/setup-branch-protection.ts');
  console.error('');
  console.error('See script header comments for GitHub App setup instructions.');
  process.exit(1);
}

/**
 * Generate JWT for GitHub App authentication
 */
function generateJWT(): string {
  if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY) {
    throw new Error('GitHub App credentials not provided');
  }

  // Note: This is a simplified version. For production, use a proper JWT library
  // like 'jsonwebtoken' or 'jose'. This example shows the concept.
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60, // Issued at (1 minute ago to account for clock skew)
    exp: now + 600, // Expires in 10 minutes
    iss: GITHUB_APP_ID, // Issuer (App ID)
  };

  // For a real implementation, you'd need to sign this with the private key
  // using RS256 algorithm. This requires a JWT library.
  console.warn('⚠️  GitHub App JWT generation requires a JWT library.');
  console.warn('   For now, using Personal Access Token authentication.');
  throw new Error('GitHub App authentication requires JWT library (e.g., jsonwebtoken)');
}

/**
 * Get installation access token for GitHub App
 */
async function getInstallationToken(): Promise<string> {
  // This would require:
  // 1. Generate JWT using the App ID and private key
  // 2. Get installation ID for the repository
  // 3. Exchange JWT for installation access token
  // For now, we'll use PAT authentication
  throw new Error('GitHub App authentication not fully implemented. Use GITHUB_TOKEN for now.');
}

/**
 * Get authentication header
 */
async function getAuthHeader(): Promise<string> {
  if (GITHUB_TOKEN) {
    return `token ${GITHUB_TOKEN}`;
  }

  if (GITHUB_APP_ID && GITHUB_APP_PRIVATE_KEY) {
    const installationToken = await getInstallationToken();
    return `Bearer ${installationToken}`;
  }

  throw new Error('No authentication method provided');
}

async function apiRequest(method: string, endpoint: string, body?: any) {
  const url = `${API_BASE}${endpoint}`;
  const authHeader = await getAuthHeader();

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: authHeader,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'stashtab-setup-script',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw { status: response.status, message: error.message || response.statusText, data: error };
  }

  return response.json();
}

async function setupBranchProtection() {
  console.log(`🔒 Setting up branch protection for ${REPO_OWNER}/${REPO_NAME}:${BRANCH}...`);
  console.log('');

  try {
    // Check if branch exists
    try {
      await apiRequest('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/branches/${BRANCH}`);
    } catch (error: any) {
      if (error.status === 404) {
        console.error(`❌ Branch '${BRANCH}' not found in ${REPO_OWNER}/${REPO_NAME}`);
        process.exit(1);
      }
      throw error;
    }

    // Configure branch protection
    await apiRequest('PUT', `/repos/${REPO_OWNER}/${REPO_NAME}/branches/${BRANCH}/protection`, {
      required_status_checks: {
        strict: true,
        contexts: ['CI / Build', 'CI / Lint', 'CI / Test', 'CI / Type Check'],
      },
      enforce_admins: true,
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        dismiss_stale_reviews: true,
        require_code_owner_reviews: false,
        require_last_push_approval: false,
      },
      restrictions: null, // Allow all users with push access
      allow_force_pushes: false,
      allow_deletions: false,
      block_creations: false,
      required_linear_history: false,
      allow_squash_merge: true,
      allow_merge_commit: true,
      allow_rebase_merge: true,
      allow_auto_merge: false,
      allow_update_branch: true,
      required_conversation_resolution: true,
      lock_branch: false,
      allow_fork_syncing: false,
    });

    console.log('✅ Branch protection configured successfully!');
    console.log('');
    console.log('Protection rules:');
    console.log('  ✓ Require status checks to pass before merging');
    console.log('  ✓ Require pull request reviews before merging (1 approval)');
    console.log('  ✓ Dismiss stale pull request approvals when new commits are pushed');
    console.log('  ✓ Require conversation resolution before merging');
    console.log('  ✓ Enforce restrictions for administrators');
    console.log('  ✓ Do not allow force pushes');
    console.log('  ✓ Do not allow branch deletion');
    console.log('');
    console.log('Required status checks:');
    console.log('  - CI / Build');
    console.log('  - CI / Lint');
    console.log('  - CI / Test');
    console.log('  - CI / Type Check');
    console.log('');
    console.log('⚠️  Note: Status checks will only appear in branch protection settings');
    console.log('   after they have run successfully at least once on the main branch.');
    console.log("   If checks don't appear, wait for the CI workflow to complete,");
    console.log('   or manually trigger it by pushing a commit to main.');
    console.log('');
    console.log('💡 Note: You can also configure this manually at:');
    console.log(`   https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/branches`);
  } catch (error: any) {
    if (error.status === 403) {
      console.error('❌ Permission denied.');
      if (GITHUB_TOKEN) {
        console.error('   Make sure your token has "repo" scope.');
        console.error('   Update token at: https://github.com/settings/tokens');
      } else {
        console.error(
          '   Make sure your GitHub App has "Administration: Read & write" permission.'
        );
        console.error(
          '   Check app permissions at: https://github.com/organizations/TRC-Crypto/settings/apps'
        );
      }
    } else if (error.status === 404) {
      console.error(`❌ Repository ${REPO_OWNER}/${REPO_NAME} not found or you don't have access.`);
    } else {
      console.error('❌ Error setting up branch protection:');
      console.error(error.message);
      if (error.data) {
        console.error(JSON.stringify(error.data, null, 2));
      }
    }
    process.exit(1);
  }
}

setupBranchProtection();
