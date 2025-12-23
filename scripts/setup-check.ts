#!/usr/bin/env tsx
/**
 * Stashtab Configuration Validator
 *
 * Validates existing configuration and API keys:
 * - Checks environment files exist
 * - Validates API key formats
 * - Tests connectivity to external services
 * - Reports configuration status
 *
 * Usage: pnpm setup:check
 */

import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '..');
const apiDir = path.join(projectRoot, 'apps', 'api');
const webDir = path.join(projectRoot, 'apps', 'web');

interface CheckResult {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, status: 'ok' | 'warning' | 'error', message: string) {
  results.push({ name, status, message });
}

function getEnvValue(content: string, key: string): string | undefined {
  const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : undefined;
}

async function validateApi(url: string, headers: Record<string, string> = {}): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🔍  STASHTAB CONFIGURATION CHECK                               ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);

async function main() {
  console.log('Checking configuration...\n');

  // ============================================================================
  // Check Environment Files
  // ============================================================================
  console.log('📁 Environment Files\n');

  // API .dev.vars
  const apiDevVarsPath = path.join(apiDir, '.dev.vars');
  if (fs.existsSync(apiDevVarsPath)) {
    check('API .dev.vars', 'ok', 'File exists');
    const content = fs.readFileSync(apiDevVarsPath, 'utf-8');

    // Check required values
    const privyAppId = getEnvValue(content, 'PRIVY_APP_ID');
    const privySecret = getEnvValue(content, 'PRIVY_APP_SECRET');
    const rpcUrl = getEnvValue(content, 'RPC_URL');

    if (privyAppId && !privyAppId.includes('your-')) {
      check('PRIVY_APP_ID', 'ok', 'Configured');
    } else {
      check('PRIVY_APP_ID', 'error', 'Not configured');
    }

    if (privySecret && !privySecret.includes('your-')) {
      check('PRIVY_APP_SECRET', 'ok', 'Configured');
    } else {
      check('PRIVY_APP_SECRET', 'error', 'Not configured');
    }

    if (rpcUrl) {
      check('RPC_URL', 'ok', rpcUrl);
    } else {
      check('RPC_URL', 'warning', 'Using default');
    }

    // Optional: Fiat providers
    const stripeKey = getEnvValue(content, 'STRIPE_SECRET_KEY');
    const moonpayKey = getEnvValue(content, 'MOONPAY_API_KEY');
    const personaKey = getEnvValue(content, 'PERSONA_API_KEY');
    const resendKey = getEnvValue(content, 'RESEND_API_KEY');

    if (stripeKey) check('Stripe', 'ok', 'Configured');
    if (moonpayKey) check('MoonPay', 'ok', 'Configured');
    if (personaKey) check('Persona KYC', 'ok', 'Configured');
    if (resendKey) check('Resend Email', 'ok', 'Configured');
  } else {
    check('API .dev.vars', 'error', 'File not found - run pnpm setup');
  }

  // Web .env.local
  const webEnvPath = path.join(webDir, '.env.local');
  if (fs.existsSync(webEnvPath)) {
    check('Web .env.local', 'ok', 'File exists');
    const content = fs.readFileSync(webEnvPath, 'utf-8');

    const webPrivyId = getEnvValue(content, 'NEXT_PUBLIC_PRIVY_APP_ID');
    const apiUrl = getEnvValue(content, 'NEXT_PUBLIC_API_URL');

    if (webPrivyId && !webPrivyId.includes('your-')) {
      check('Web PRIVY_APP_ID', 'ok', 'Configured');
    } else {
      check('Web PRIVY_APP_ID', 'error', 'Not configured');
    }

    if (apiUrl) {
      check('API URL', 'ok', apiUrl);
    } else {
      check('API URL', 'warning', 'Not set');
    }
  } else {
    check('Web .env.local', 'error', 'File not found - run pnpm setup');
  }

  // ============================================================================
  // Check wrangler.toml
  // ============================================================================
  console.log('\n📦 Cloudflare Configuration\n');

  const wranglerPath = path.join(apiDir, 'wrangler.toml');
  if (fs.existsSync(wranglerPath)) {
    const content = fs.readFileSync(wranglerPath, 'utf-8');

    const d1Id = content.match(/database_id\s*=\s*"([^"]+)"/)?.[1];
    const kvId = content.match(/kv_namespaces[\s\S]*?id\s*=\s*"([^"]+)"/)?.[1];

    if (d1Id && !d1Id.includes('YOUR_')) {
      check('D1 Database', 'ok', d1Id.slice(0, 8) + '...');
    } else {
      check('D1 Database', 'error', 'Not configured');
    }

    if (kvId && !kvId.includes('YOUR_')) {
      check('KV Namespace', 'ok', kvId.slice(0, 8) + '...');
    } else {
      check('KV Namespace', 'error', 'Not configured');
    }
  } else {
    check('wrangler.toml', 'error', 'File not found');
  }

  // ============================================================================
  // Validate API Keys (if configured)
  // ============================================================================
  console.log('\n🔐 API Key Validation\n');

  if (fs.existsSync(apiDevVarsPath)) {
    const content = fs.readFileSync(apiDevVarsPath, 'utf-8');

    // Validate Privy
    const privyAppId = getEnvValue(content, 'PRIVY_APP_ID');
    const privySecret = getEnvValue(content, 'PRIVY_APP_SECRET');

    if (privyAppId && privySecret && !privyAppId.includes('your-')) {
      console.log('  Testing Privy connection...');
      const isValid = await validateApi('https://auth.privy.io/api/v1/apps/self', {
        'privy-app-id': privyAppId,
        Authorization: `Basic ${Buffer.from(`${privyAppId}:${privySecret}`).toString('base64')}`,
      });
      check('Privy API', isValid ? 'ok' : 'error', isValid ? 'Connected' : 'Failed to connect');
    }

    // Validate Stripe
    const stripeKey = getEnvValue(content, 'STRIPE_SECRET_KEY');
    if (stripeKey && stripeKey.startsWith('sk_')) {
      console.log('  Testing Stripe connection...');
      const isValid = await validateApi('https://api.stripe.com/v1/balance', {
        Authorization: `Bearer ${stripeKey}`,
      });
      check('Stripe API', isValid ? 'ok' : 'error', isValid ? 'Connected' : 'Failed to connect');
    }

    // Validate MoonPay
    const moonpayKey = getEnvValue(content, 'MOONPAY_API_KEY');
    if (moonpayKey) {
      console.log('  Testing MoonPay connection...');
      const isValid = await validateApi(
        `https://api.moonpay.com/v3/ip_address?apiKey=${moonpayKey}`
      );
      check('MoonPay API', isValid ? 'ok' : 'error', isValid ? 'Connected' : 'Failed to connect');
    }

    // Validate Resend
    const resendKey = getEnvValue(content, 'RESEND_API_KEY');
    if (resendKey && resendKey.startsWith('re_')) {
      console.log('  Testing Resend connection...');
      const isValid = await validateApi('https://api.resend.com/domains', {
        Authorization: `Bearer ${resendKey}`,
      });
      check('Resend API', isValid ? 'ok' : 'error', isValid ? 'Connected' : 'Failed to connect');
    }
  }

  // ============================================================================
  // Print Results
  // ============================================================================
  console.log('\n' + '═'.repeat(66));
  console.log('\n📊 Configuration Summary\n');

  const errors = results.filter((r) => r.status === 'error');
  const warnings = results.filter((r) => r.status === 'warning');
  const ok = results.filter((r) => r.status === 'ok');

  for (const result of results) {
    const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️ ' : '❌';
    console.log(`  ${icon} ${result.name}: ${result.message}`);
  }

  console.log('\n' + '═'.repeat(66));

  if (errors.length === 0) {
    console.log(`
✅ All checks passed!

Your Stashtab instance is properly configured.
Run 'pnpm dev' to start development.
`);
  } else {
    console.log(`
❌ ${errors.length} error(s) found

Please fix the issues above and run 'pnpm setup:check' again.
Run 'pnpm setup' to reconfigure.
`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Check failed:', error);
  process.exit(1);
});
