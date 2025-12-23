#!/usr/bin/env tsx
/**
 * Automated Deployment Script
 *
 * One-click deployment to Cloudflare that:
 * - Creates all Cloudflare resources (D1, KV, Workers, Pages)
 * - Configures environment variables
 * - Runs migrations automatically
 * - Sets up GitHub Actions secrets (optional)
 * - Provides deployment status
 *
 * Usage:
 *   pnpm deploy:auto
 *   pnpm deploy:auto --skip-resources  # Skip resource creation
 *   pnpm deploy:auto --production      # Deploy to production
 */

import * as readline from 'readline';
import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
};

const questionYN = async (prompt: string, defaultYes = false): Promise<boolean> => {
  const suffix = defaultYes ? '(Y/n)' : '(y/N)';
  const answer = await question(`${prompt} ${suffix}: `);
  if (answer === '') return defaultYes;
  return answer.toLowerCase() === 'y';
};

const runCommand = (
  command: string,
  options?: { cwd?: string; silent?: boolean; env?: Record<string, string> }
): string => {
  try {
    const result = execSync(command, {
      cwd: options?.cwd,
      encoding: 'utf-8',
      stdio: options?.silent ? 'pipe' : 'inherit',
      env: { ...process.env, ...options?.env },
    });
    return result?.toString() || '';
  } catch (error: unknown) {
    if (options?.silent) {
      const err = error as { stdout?: string };
      return err.stdout?.toString() || '';
    }
    throw error;
  }
};

const checkWranglerAuth = (): boolean => {
  try {
    const result = spawnSync('npx', ['wrangler', 'whoami'], {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return !result.stdout.includes('Not logged in');
  } catch {
    return false;
  }
};

interface DeploymentConfig {
  environment: 'development' | 'production';
  skipResources: boolean;
  skipMigrations: boolean;
  skipSecrets: boolean;
  projectName: string;
  apiProjectName: string;
  webProjectName: string;
  adminProjectName: string;
}

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🚀  STASHTAB AUTOMATED DEPLOYMENT                               ║
║                                                                  ║
║   This script will deploy your neobank to Cloudflare              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const apiDir = path.join(projectRoot, 'apps', 'api');
  const webDir = path.join(projectRoot, 'apps', 'web');
  const adminDir = path.join(projectRoot, 'apps', 'admin');

  const config: DeploymentConfig = {
    environment: 'development',
    skipResources: false,
    skipMigrations: false,
    skipSecrets: false,
    projectName: 'stashtab',
    apiProjectName: 'stashtab-api',
    webProjectName: 'stashtab-web',
    adminProjectName: 'stashtab-admin',
  };

  // Parse command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--production')) config.environment = 'production';
  if (args.includes('--skip-resources')) config.skipResources = true;
  if (args.includes('--skip-migrations')) config.skipMigrations = true;
  if (args.includes('--skip-secrets')) config.skipSecrets = true;

  // ============================================================================
  // Step 1: Prerequisites Check
  // ============================================================================
  console.log('\n📋 Step 1: Checking prerequisites...\n');

  console.log('  Checking Cloudflare authentication...');
  if (!checkWranglerAuth()) {
    console.log("\n  ⚠️  You're not logged into Cloudflare. Running 'wrangler login'...\n");
    runCommand('npx wrangler login');
  } else {
    console.log('  ✅ Cloudflare authenticated\n');
  }

  // Check if wrangler.toml exists
  const wranglerPath = path.join(apiDir, 'wrangler.toml');
  if (!fs.existsSync(wranglerPath)) {
    console.error('  ❌ wrangler.toml not found. Please run pnpm setup first.');
    process.exit(1);
  }

  // ============================================================================
  // Step 2: Create Cloudflare Resources (if needed)
  // ============================================================================
  if (!config.skipResources) {
    console.log('📋 Step 2: Creating Cloudflare resources...\n');

    let d1DatabaseId = '';
    let kvNamespaceId = '';

    // Check if D1 database exists
    const wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');
    const d1Match = wranglerContent.match(/database_id\s*=\s*"([^"]+)"/);
    const kvMatch = wranglerContent.match(/id\s*=\s*"([^"]+)"/);

    if (!d1Match || d1Match[1].includes('YOUR_')) {
      console.log('  Creating D1 database...');
      try {
        const output = runCommand('npx wrangler d1 create stashtab-db 2>&1', {
          cwd: apiDir,
          silent: true,
        });

        const idMatch = output.match(/database_id\s*=\s*"([^"]+)"/);
        if (idMatch) {
          d1DatabaseId = idMatch[1];
          console.log(`  ✅ D1 database created: ${d1DatabaseId}\n`);

          // Update wrangler.toml
          const updated = wranglerContent.replace(
            /database_id\s*=\s*"[^"]*"/,
            `database_id = "${d1DatabaseId}"`
          );
          fs.writeFileSync(wranglerPath, updated);
        }
      } catch (error) {
        console.log('  ⚠️  Failed to create D1 database. You may need to create it manually.\n');
      }
    } else {
      d1DatabaseId = d1Match[1];
      console.log(`  ✅ D1 database already configured: ${d1DatabaseId.slice(0, 8)}...\n`);
    }

    if (!kvMatch || kvMatch[1].includes('YOUR_')) {
      console.log('  Creating KV namespace...');
      try {
        const output = runCommand('npx wrangler kv:namespace create CACHE 2>&1', {
          cwd: apiDir,
          silent: true,
        });

        const idMatch = output.match(/id\s*=\s*"([^"]+)"/);
        if (idMatch) {
          kvNamespaceId = idMatch[1];
          console.log(`  ✅ KV namespace created: ${kvNamespaceId}\n`);

          // Update wrangler.toml
          const updated = fs
            .readFileSync(wranglerPath, 'utf-8')
            .replace(/id\s*=\s*"YOUR_KV_NAMESPACE_ID"/, `id = "${kvNamespaceId}"`);
          fs.writeFileSync(wranglerPath, updated);
        }
      } catch (error) {
        console.log('  ⚠️  Failed to create KV namespace. You may need to create it manually.\n');
      }
    } else {
      kvNamespaceId = kvMatch[1];
      console.log(`  ✅ KV namespace already configured: ${kvNamespaceId.slice(0, 8)}...\n`);
    }
  }

  // ============================================================================
  // Step 3: Run Database Migrations
  // ============================================================================
  if (!config.skipMigrations) {
    console.log('📋 Step 3: Running database migrations...\n');

    const migrationsDir = path.join(apiDir, 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      console.log(`  Found ${migrationFiles.length} migration(s)\n`);

      for (const file of migrationFiles) {
        console.log(`  Applying ${file}...`);
        try {
          runCommand(`npx wrangler d1 execute stashtab-db --file=migrations/${file}`, {
            cwd: apiDir,
          });
          console.log(`  ✅ ${file} applied\n`);
        } catch (error) {
          console.log(`  ⚠️  Failed to apply ${file}. Continuing...\n`);
        }
      }
    }
  }

  // ============================================================================
  // Step 4: Build Applications
  // ============================================================================
  console.log('📋 Step 4: Building applications...\n');

  console.log('  Building API...');
  try {
    runCommand('pnpm build', { cwd: apiDir });
    console.log('  ✅ API built\n');
  } catch (error) {
    console.error('  ❌ API build failed');
    process.exit(1);
  }

  console.log('  Building web app...');
  try {
    runCommand('pnpm build', { cwd: webDir });
    console.log('  ✅ Web app built\n');
  } catch (error) {
    console.error('  ❌ Web app build failed');
    process.exit(1);
  }

  console.log('  Building admin dashboard...');
  try {
    runCommand('pnpm build', { cwd: adminDir });
    console.log('  ✅ Admin dashboard built\n');
  } catch (error) {
    console.error('  ❌ Admin dashboard build failed');
    process.exit(1);
  }

  // ============================================================================
  // Step 5: Deploy to Cloudflare
  // ============================================================================
  console.log('📋 Step 5: Deploying to Cloudflare...\n');

  // Deploy API
  console.log('  Deploying API to Cloudflare Workers...');
  try {
    runCommand('npx wrangler deploy', { cwd: apiDir });
    console.log('  ✅ API deployed\n');
  } catch (error) {
    console.error('  ❌ API deployment failed');
    process.exit(1);
  }

  // Deploy Web
  console.log('  Deploying web app to Cloudflare Pages...');
  try {
    runCommand(`npx wrangler pages deploy .next --project-name=${config.webProjectName}`, {
      cwd: webDir,
    });
    console.log('  ✅ Web app deployed\n');
  } catch (error) {
    console.error('  ❌ Web app deployment failed');
    process.exit(1);
  }

  // Deploy Admin
  console.log('  Deploying admin dashboard to Cloudflare Pages...');
  try {
    runCommand(`npx wrangler pages deploy .next --project-name=${config.adminProjectName}`, {
      cwd: adminDir,
    });
    console.log('  ✅ Admin dashboard deployed\n');
  } catch (error) {
    console.error('  ❌ Admin dashboard deployment failed');
    process.exit(1);
  }

  // ============================================================================
  // Step 6: Get Deployment URLs
  // ============================================================================
  console.log('📋 Step 6: Getting deployment URLs...\n');

  try {
    const apiInfo = runCommand('npx wrangler deployments list --limit 1', {
      cwd: apiDir,
      silent: true,
    });

    console.log('  ✅ Deployment complete!\n');
    console.log('  Your applications are live at:');
    console.log(`    API: https://${config.apiProjectName}.workers.dev`);
    console.log(`    Web: https://${config.webProjectName}.pages.dev`);
    console.log(`    Admin: https://${config.adminProjectName}.pages.dev\n`);
  } catch {
    console.log('  ✅ Deployment complete!\n');
  }

  // ============================================================================
  // Step 7: Setup GitHub Secrets (Optional)
  // ============================================================================
  if (!config.skipSecrets) {
    const setupSecrets = await questionYN(
      '\n  Set up GitHub Actions secrets for automated deployments?',
      false
    );

    if (setupSecrets) {
      console.log('\n  To enable GitHub Actions deployments, add these secrets:\n');
      console.log('    CLOUDFLARE_API_TOKEN - Your Cloudflare API token');
      console.log('    CLOUDFLARE_ACCOUNT_ID - Your Cloudflare account ID');
      console.log('    PRIVY_APP_ID - Your Privy app ID');
      console.log('    PRIVY_APP_SECRET - Your Privy app secret\n');
      console.log('  You can find these in:');
      console.log('    - Cloudflare: https://dash.cloudflare.com/profile/api-tokens');
      console.log('    - Privy: https://dashboard.privy.io\n');
    }
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ✅  DEPLOYMENT COMPLETE!                                       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

Next steps:

  1. Configure your domain (optional):
     - Add custom domains in Cloudflare dashboard
     - Update CORS settings in API if needed

  2. Set up monitoring:
     - View logs: npx wrangler tail
     - Check analytics in Cloudflare dashboard

  3. Test your deployment:
     - Visit your web app URL
     - Test API endpoints
     - Verify database migrations

  4. Enable GitHub Actions (optional):
     - Add secrets to your repository
     - Push to main branch to auto-deploy

For more help, see docs/DEPLOY.md
`);

  rl.close();
}

main().catch((error) => {
  console.error('Deployment failed:', error);
  rl.close();
  process.exit(1);
});
