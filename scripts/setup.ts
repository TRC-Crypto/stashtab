#!/usr/bin/env tsx
/**
 * Stashtab Setup Wizard
 *
 * Interactive CLI to set up your Stashtab instance:
 * - Configure core credentials (Privy, RPC)
 * - Select optional integrations (Fiat, KYC, Notifications)
 * - Create Cloudflare D1 database
 * - Create Cloudflare KV namespace
 * - Update wrangler.toml with generated IDs
 * - Run database migrations
 * - Generate .env files
 * - Validate API key configurations
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

const questionSecret = async (prompt: string): Promise<string> => {
  // For secrets, we don't want to echo
  const answer = await question(`${prompt}: `);
  return answer;
};

const runCommand = (command: string, options?: { cwd?: string; silent?: boolean }): string => {
  try {
    const result = execSync(command, {
      cwd: options?.cwd,
      encoding: 'utf-8',
      stdio: options?.silent ? 'pipe' : 'inherit',
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

// Validation functions
async function validatePrivyCredentials(appId: string, appSecret: string): Promise<boolean> {
  if (!appId || !appSecret) return false;
  try {
    const response = await fetch('https://auth.privy.io/api/v1/apps/self', {
      headers: {
        'privy-app-id': appId,
        Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function validateStripeKey(secretKey: string): Promise<boolean> {
  if (!secretKey) return false;
  try {
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function validateMoonPayKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  try {
    const response = await fetch(`https://api.moonpay.com/v3/ip_address?apiKey=${apiKey}`);
    return response.ok;
  } catch {
    return false;
  }
}

async function validateResendKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  try {
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

interface SetupConfig {
  // Core
  privyAppId: string;
  privyAppSecret: string;
  rpcUrl: string;
  chainId: string;
  environment: 'development' | 'production';

  // Cloudflare
  d1DatabaseId: string;
  kvNamespaceId: string;

  // Fiat providers
  enableFiat: boolean;
  fiatProvider?: 'stripe' | 'moonpay' | 'both';
  stripePublicKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  moonpayApiKey?: string;
  moonpaySecretKey?: string;
  moonpayWebhookSecret?: string;

  // KYC
  enableKyc: boolean;
  kycProvider?: 'persona' | 'sumsub';
  personaApiKey?: string;
  personaTemplateId?: string;
  personaWebhookSecret?: string;

  // Notifications
  enableNotifications: boolean;
  enableEmail: boolean;
  resendApiKey?: string;
  resendFromEmail?: string;
  enablePush: boolean;
  expoAccessToken?: string;
}

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🏦  STASHTAB SETUP WIZARD v2.0                                 ║
║                                                                  ║
║   This wizard will help you configure your neobank instance      ║
║   with optional integrations for fiat, KYC, and notifications    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const apiDir = path.join(projectRoot, 'apps', 'api');
  const webDir = path.join(projectRoot, 'apps', 'web');
  const mobileDir = path.join(projectRoot, 'apps', 'mobile');

  const config: Partial<SetupConfig> = {
    environment: 'development',
    chainId: '84532', // Base Sepolia
    rpcUrl: 'https://sepolia.base.org',
  };

  // ============================================================================
  // Step 1: Prerequisites
  // ============================================================================
  console.log('\n📋 Step 1: Checking prerequisites...\n');

  console.log('  Checking Cloudflare authentication...');
  if (!checkWranglerAuth()) {
    console.log("\n  ⚠️  You're not logged into Cloudflare. Running 'wrangler login'...\n");
    runCommand('npx wrangler login');
  } else {
    console.log('  ✅ Cloudflare authenticated\n');
  }

  // ============================================================================
  // Step 2: Environment Selection
  // ============================================================================
  console.log('📋 Step 2: Environment Configuration\n');

  const isProd = await questionYN('  Are you setting up for production?', false);
  config.environment = isProd ? 'production' : 'development';

  if (isProd) {
    config.chainId = '8453'; // Base mainnet
    config.rpcUrl =
      (await question('  Enter Base mainnet RPC URL (or press Enter for default): ')) ||
      'https://mainnet.base.org';
  } else {
    const customRpc = await question('  Custom RPC URL (press Enter for Base Sepolia default): ');
    if (customRpc) config.rpcUrl = customRpc;
  }

  console.log(`\n  ✅ Environment: ${config.environment}`);
  console.log(`  ✅ Chain ID: ${config.chainId}`);
  console.log(`  ✅ RPC URL: ${config.rpcUrl}\n`);

  // ============================================================================
  // Step 3: Privy Configuration
  // ============================================================================
  console.log('📋 Step 3: Privy Configuration (Required)\n');
  console.log('  Get your credentials from https://dashboard.privy.io\n');

  config.privyAppId = await question('  Enter your Privy App ID: ');
  config.privyAppSecret = await questionSecret('  Enter your Privy App Secret');

  if (config.privyAppId && config.privyAppSecret) {
    console.log('\n  Validating Privy credentials...');
    const isValid = await validatePrivyCredentials(config.privyAppId, config.privyAppSecret);
    if (isValid) {
      console.log('  ✅ Privy credentials validated\n');
    } else {
      console.log('  ⚠️  Could not validate Privy credentials. Please verify they are correct.\n');
    }
  } else {
    console.log('\n  ⚠️  Privy credentials are required. You can add them later to .env files.\n');
  }

  // ============================================================================
  // Step 4: Fiat Integration Selection
  // ============================================================================
  console.log('📋 Step 4: Fiat On/Off Ramp Integration (Optional)\n');
  console.log('  Enable fiat purchases using card/bank transfers\n');

  config.enableFiat = await questionYN('  Enable fiat integration?', false);

  if (config.enableFiat) {
    console.log('\n  Available providers:');
    console.log('    1. Stripe - Card payments (on-ramp only)');
    console.log('    2. MoonPay - Card/bank (on-ramp + off-ramp)');
    console.log('    3. Both\n');

    const providerChoice = await question('  Select provider(s) [1/2/3]: ');
    config.fiatProvider =
      providerChoice === '1' ? 'stripe' : providerChoice === '2' ? 'moonpay' : 'both';

    if (config.fiatProvider === 'stripe' || config.fiatProvider === 'both') {
      console.log('\n  Stripe Configuration (https://dashboard.stripe.com/apikeys)');
      config.stripePublicKey = await question('    Publishable key: ');
      config.stripeSecretKey = await questionSecret('    Secret key');
      config.stripeWebhookSecret = await questionSecret('    Webhook secret (optional)');

      if (config.stripeSecretKey) {
        console.log('    Validating Stripe key...');
        const isValid = await validateStripeKey(config.stripeSecretKey);
        console.log(
          isValid ? '    ✅ Stripe key validated' : '    ⚠️  Could not validate Stripe key'
        );
      }
    }

    if (config.fiatProvider === 'moonpay' || config.fiatProvider === 'both') {
      console.log('\n  MoonPay Configuration (https://dashboard.moonpay.com)');
      config.moonpayApiKey = await question('    API key: ');
      config.moonpaySecretKey = await questionSecret('    Secret key (optional)');
      config.moonpayWebhookSecret = await questionSecret('    Webhook secret (optional)');

      if (config.moonpayApiKey) {
        console.log('    Validating MoonPay key...');
        const isValid = await validateMoonPayKey(config.moonpayApiKey);
        console.log(
          isValid ? '    ✅ MoonPay key validated' : '    ⚠️  Could not validate MoonPay key'
        );
      }
    }

    console.log('\n  ✅ Fiat integration configured\n');
  }

  // ============================================================================
  // Step 5: KYC Integration Selection
  // ============================================================================
  console.log('📋 Step 5: KYC/Identity Verification (Optional)\n');
  console.log('  Enable identity verification for compliance\n');

  config.enableKyc = await questionYN('  Enable KYC integration?', false);

  if (config.enableKyc) {
    console.log('\n  Available providers:');
    console.log('    1. Persona - Modern identity verification');
    console.log('    2. Sumsub - Comprehensive KYC/AML\n');

    const kycChoice = await question('  Select provider [1/2]: ');
    config.kycProvider = kycChoice === '2' ? 'sumsub' : 'persona';

    if (config.kycProvider === 'persona') {
      console.log('\n  Persona Configuration (https://withpersona.com)');
      config.personaApiKey = await question('    API key: ');
      config.personaTemplateId = await question('    Inquiry template ID: ');
      config.personaWebhookSecret = await questionSecret('    Webhook secret (optional)');
    }

    console.log('\n  ✅ KYC integration configured\n');
  }

  // ============================================================================
  // Step 6: Notification Integration
  // ============================================================================
  console.log('📋 Step 6: Notifications (Optional)\n');

  config.enableNotifications = await questionYN('  Enable notifications?', false);

  if (config.enableNotifications) {
    console.log('\n  Email notifications (Resend):');
    config.enableEmail = await questionYN('    Enable email notifications?', true);

    if (config.enableEmail) {
      console.log('\n  Resend Configuration (https://resend.com)');
      config.resendApiKey = await question('    API key: ');
      config.resendFromEmail = await question('    From email address: ');

      if (config.resendApiKey) {
        console.log('    Validating Resend key...');
        const isValid = await validateResendKey(config.resendApiKey);
        console.log(
          isValid ? '    ✅ Resend key validated' : '    ⚠️  Could not validate Resend key'
        );
      }
    }

    console.log('\n  Push notifications (Expo):');
    config.enablePush = await questionYN('    Enable push notifications?', false);

    if (config.enablePush) {
      config.expoAccessToken = await questionSecret('    Expo access token (optional)');
    }

    console.log('\n  ✅ Notifications configured\n');
  }

  // ============================================================================
  // Step 7: Cloudflare Resources
  // ============================================================================
  console.log('📋 Step 7: Creating Cloudflare resources...\n');

  // Create D1 database
  console.log("  Creating D1 database 'stashtab-db'...");
  try {
    const d1Output = runCommand('npx wrangler d1 create stashtab-db 2>&1', {
      cwd: apiDir,
      silent: true,
    });

    const idMatch = d1Output.match(/database_id\s*=\s*"([^"]+)"/);
    if (idMatch) {
      config.d1DatabaseId = idMatch[1];
      console.log(`  ✅ D1 database created: ${config.d1DatabaseId}\n`);
    } else if (d1Output.includes('already exists')) {
      console.log('  ℹ️  D1 database already exists\n');
      config.d1DatabaseId = await question('  Enter existing database_id: ');
    }
  } catch (error) {
    console.log('  ⚠️  Failed to create D1 database.\n');
    config.d1DatabaseId = await question('  Enter database_id manually (or press Enter to skip): ');
  }

  // Create KV namespace
  console.log("  Creating KV namespace 'CACHE'...");
  try {
    const kvOutput = runCommand('npx wrangler kv:namespace create CACHE 2>&1', {
      cwd: apiDir,
      silent: true,
    });

    const kvMatch = kvOutput.match(/id\s*=\s*"([^"]+)"/);
    if (kvMatch) {
      config.kvNamespaceId = kvMatch[1];
      console.log(`  ✅ KV namespace created: ${config.kvNamespaceId}\n`);
    } else if (kvOutput.includes('already exists')) {
      console.log('  ℹ️  KV namespace already exists\n');
      config.kvNamespaceId = await question('  Enter existing KV namespace id: ');
    }
  } catch (error) {
    console.log('  ⚠️  Failed to create KV namespace.\n');
    config.kvNamespaceId = await question(
      '  Enter KV namespace id manually (or press Enter to skip): '
    );
  }

  // ============================================================================
  // Step 8: Update wrangler.toml
  // ============================================================================
  console.log('📋 Step 8: Updating wrangler.toml...\n');

  const wranglerPath = path.join(apiDir, 'wrangler.toml');
  let wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');

  if (config.d1DatabaseId) {
    wranglerContent = wranglerContent.replace(
      /database_id\s*=\s*"YOUR_D1_DATABASE_ID"/,
      `database_id = "${config.d1DatabaseId}"`
    );
  }

  if (config.kvNamespaceId) {
    wranglerContent = wranglerContent.replace(
      /id\s*=\s*"YOUR_KV_NAMESPACE_ID"/,
      `id = "${config.kvNamespaceId}"`
    );
  }

  fs.writeFileSync(wranglerPath, wranglerContent);
  console.log('  ✅ wrangler.toml updated\n');

  // ============================================================================
  // Step 9: Run Database Migrations
  // ============================================================================
  console.log('📋 Step 9: Running database migrations...\n');

  if (config.d1DatabaseId) {
    try {
      console.log('  Applying migrations to local database...');

      // Apply all migrations
      const migrationsDir = path.join(apiDir, 'migrations');
      const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        runCommand(`npx wrangler d1 execute stashtab-db --local --file=migrations/${file}`, {
          cwd: apiDir,
          silent: true,
        });
      }
      console.log(`  ✅ Applied ${migrationFiles.length} migrations locally\n`);

      const applyRemote = await questionYN('  Apply migrations to remote database?', false);
      if (applyRemote) {
        console.log('  Applying migrations to remote database...');
        for (const file of migrationFiles) {
          runCommand(`npx wrangler d1 execute stashtab-db --file=migrations/${file}`, {
            cwd: apiDir,
          });
        }
        console.log('  ✅ Remote migrations applied\n');
      }
    } catch (error) {
      console.log('  ⚠️  Failed to run migrations. Run them manually:\n');
      console.log(
        '     cd apps/api && npx wrangler d1 execute stashtab-db --local --file=migrations/0001_init.sql\n'
      );
    }
  }

  // ============================================================================
  // Step 10: Generate Environment Files
  // ============================================================================
  console.log('📋 Step 10: Generating environment files...\n');

  // API .dev.vars
  const devVarsLines = [
    '# Core Configuration',
    `PRIVY_APP_ID=${config.privyAppId || 'your-privy-app-id'}`,
    `PRIVY_APP_SECRET=${config.privyAppSecret || 'your-privy-app-secret'}`,
    `RPC_URL=${config.rpcUrl}`,
    `CHAIN_ID=${config.chainId}`,
    `ENVIRONMENT=${config.environment}`,
    '',
  ];

  if (config.enableFiat) {
    devVarsLines.push('# Fiat Integration');
    if (config.stripePublicKey) devVarsLines.push(`STRIPE_PUBLIC_KEY=${config.stripePublicKey}`);
    if (config.stripeSecretKey) devVarsLines.push(`STRIPE_SECRET_KEY=${config.stripeSecretKey}`);
    if (config.stripeWebhookSecret)
      devVarsLines.push(`STRIPE_WEBHOOK_SECRET=${config.stripeWebhookSecret}`);
    if (config.moonpayApiKey) devVarsLines.push(`MOONPAY_API_KEY=${config.moonpayApiKey}`);
    if (config.moonpaySecretKey) devVarsLines.push(`MOONPAY_SECRET_KEY=${config.moonpaySecretKey}`);
    if (config.moonpayWebhookSecret)
      devVarsLines.push(`MOONPAY_WEBHOOK_SECRET=${config.moonpayWebhookSecret}`);
    devVarsLines.push('');
  }

  if (config.enableKyc) {
    devVarsLines.push('# KYC Integration');
    if (config.personaApiKey) devVarsLines.push(`PERSONA_API_KEY=${config.personaApiKey}`);
    if (config.personaTemplateId)
      devVarsLines.push(`PERSONA_TEMPLATE_ID=${config.personaTemplateId}`);
    if (config.personaWebhookSecret)
      devVarsLines.push(`PERSONA_WEBHOOK_SECRET=${config.personaWebhookSecret}`);
    devVarsLines.push('');
  }

  if (config.enableNotifications) {
    devVarsLines.push('# Notifications');
    if (config.resendApiKey) devVarsLines.push(`RESEND_API_KEY=${config.resendApiKey}`);
    if (config.resendFromEmail) devVarsLines.push(`RESEND_FROM_EMAIL=${config.resendFromEmail}`);
    if (config.expoAccessToken) devVarsLines.push(`EXPO_ACCESS_TOKEN=${config.expoAccessToken}`);
    devVarsLines.push('');
  }

  fs.writeFileSync(path.join(apiDir, '.dev.vars'), devVarsLines.join('\n'));
  console.log('  ✅ Created apps/api/.dev.vars\n');

  // Web .env.local
  const envLocalLines = [
    '# Privy',
    `NEXT_PUBLIC_PRIVY_APP_ID=${config.privyAppId || 'your-privy-app-id'}`,
    '',
    '# API URL',
    `NEXT_PUBLIC_API_URL=${config.environment === 'production' ? 'https://api.stashtab.app' : 'http://localhost:8787'}`,
    '',
    '# Chain Configuration',
    `NEXT_PUBLIC_CHAIN_ID=${config.chainId}`,
    '',
  ];

  if (config.stripePublicKey) {
    envLocalLines.push('# Stripe');
    envLocalLines.push(`NEXT_PUBLIC_STRIPE_PUBLIC_KEY=${config.stripePublicKey}`);
    envLocalLines.push('');
  }

  if (config.moonpayApiKey) {
    envLocalLines.push('# MoonPay');
    envLocalLines.push(`NEXT_PUBLIC_MOONPAY_API_KEY=${config.moonpayApiKey}`);
    envLocalLines.push('');
  }

  fs.writeFileSync(path.join(webDir, '.env.local'), envLocalLines.join('\n'));
  console.log('  ✅ Created apps/web/.env.local\n');

  // Mobile .env
  if (fs.existsSync(mobileDir)) {
    const mobileEnvLines = [
      `EXPO_PUBLIC_PRIVY_APP_ID=${config.privyAppId || 'your-privy-app-id'}`,
      `EXPO_PUBLIC_API_URL=${config.environment === 'production' ? 'https://api.stashtab.app' : 'http://localhost:8787'}`,
      `EXPO_PUBLIC_CHAIN_ID=${config.chainId}`,
    ];
    fs.writeFileSync(path.join(mobileDir, '.env'), mobileEnvLines.join('\n'));
    console.log('  ✅ Created apps/mobile/.env\n');
  }

  // ============================================================================
  // Step 11: Cloudflare Secrets
  // ============================================================================
  console.log('📋 Step 11: Cloudflare Secrets\n');

  const setSecrets = await questionYN('  Set secrets in Cloudflare Workers?', false);

  if (setSecrets) {
    const secrets: Record<string, string | undefined> = {
      PRIVY_APP_ID: config.privyAppId,
      PRIVY_APP_SECRET: config.privyAppSecret,
      RPC_URL: config.rpcUrl,
      CHAIN_ID: config.chainId,
    };

    if (config.enableFiat) {
      if (config.stripeSecretKey) secrets.STRIPE_SECRET_KEY = config.stripeSecretKey;
      if (config.stripeWebhookSecret) secrets.STRIPE_WEBHOOK_SECRET = config.stripeWebhookSecret;
      if (config.moonpayApiKey) secrets.MOONPAY_API_KEY = config.moonpayApiKey;
      if (config.moonpaySecretKey) secrets.MOONPAY_SECRET_KEY = config.moonpaySecretKey;
    }

    if (config.enableKyc) {
      if (config.personaApiKey) secrets.PERSONA_API_KEY = config.personaApiKey;
      if (config.personaTemplateId) secrets.PERSONA_TEMPLATE_ID = config.personaTemplateId;
    }

    if (config.enableNotifications) {
      if (config.resendApiKey) secrets.RESEND_API_KEY = config.resendApiKey;
    }

    for (const [key, value] of Object.entries(secrets)) {
      if (value) {
        console.log(`  Setting ${key}...`);
        try {
          execSync(`echo "${value}" | npx wrangler secret put ${key}`, {
            cwd: apiDir,
            stdio: 'pipe',
          });
        } catch {
          console.log(`  ⚠️  Failed to set ${key}`);
        }
      }
    }

    console.log('\n  ✅ Secrets configured\n');
  }

  // ============================================================================
  // Done!
  // ============================================================================
  const enabledFeatures = [];
  if (config.enableFiat) enabledFeatures.push(`Fiat (${config.fiatProvider})`);
  if (config.enableKyc) enabledFeatures.push(`KYC (${config.kycProvider})`);
  if (config.enableNotifications) {
    const notifTypes = [];
    if (config.enableEmail) notifTypes.push('email');
    if (config.enablePush) notifTypes.push('push');
    enabledFeatures.push(`Notifications (${notifTypes.join(', ')})`);
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ✅  SETUP COMPLETE!                                            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

Configuration Summary:
  • Environment: ${config.environment}
  • Chain: ${config.chainId === '84532' ? 'Base Sepolia (testnet)' : 'Base (mainnet)'}
  • Features: ${enabledFeatures.length > 0 ? enabledFeatures.join(', ') : 'Core only'}

Next steps:

  1. Start development:
     $ pnpm dev

  2. Open the app:
     - Frontend: http://localhost:3000
     - API: http://localhost:8787
     - API Docs: http://localhost:8787/docs

  3. Configure Privy (if not done):
     - Go to https://dashboard.privy.io
     - Add http://localhost:3000 to allowed origins
     - Configure login methods (email, social, wallet)

  4. Validate configuration:
     $ pnpm setup:check

  5. Deploy when ready:
     $ pnpm build
     $ pnpm deploy

For more help, see docs/DEPLOY.md
`);

  rl.close();
}

main().catch((error) => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});
