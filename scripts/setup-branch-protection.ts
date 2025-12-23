#!/usr/bin/env tsx
/**
 * Setup Branch Protection for main branch
 *
 * This script configures branch protection rules for the main branch using the GitHub API.
 *
 * Usage:
 *   GITHUB_TOKEN=your_token tsx scripts/setup-branch-protection.ts
 *
 * Or set GITHUB_TOKEN in your environment:
 *   export GITHUB_TOKEN=your_token
 *   tsx scripts/setup-branch-protection.ts
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'TRC-Crypto';
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'stashtab';
const BRANCH = 'main';
const API_BASE = 'https://api.github.com';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  console.error('');
  console.error('Usage:');
  console.error('  GITHUB_TOKEN=your_token tsx scripts/setup-branch-protection.ts');
  console.error('');
  console.error('You can create a token at: https://github.com/settings/tokens');
  console.error('Required scopes: repo (Full control of private repositories)');
  process.exit(1);
}

async function apiRequest(method: string, endpoint: string, body?: any) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
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
        contexts: [
          'CI / Build (push)',
          'CI / Lint (push)',
          'CI / Test (push)',
          'CI / Type Check (push)',
        ],
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
    console.log('  - CI / Build (push)');
    console.log('  - CI / Lint (push)');
    console.log('  - CI / Test (push)');
    console.log('  - CI / Type Check (push)');
    console.log('');
    console.log('💡 Note: You can also configure this manually at:');
    console.log(`   https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/branches`);
  } catch (error: any) {
    if (error.status === 403) {
      console.error('❌ Permission denied. Make sure your token has "repo" scope.');
      console.error('   Update token at: https://github.com/settings/tokens');
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
