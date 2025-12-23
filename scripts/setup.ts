#!/usr/bin/env tsx
/**
 * Stashtab Setup Wizard
 *
 * Interactive CLI to set up your Stashtab instance:
 * - Configure Privy credentials
 * - Create Cloudflare D1 database
 * - Create Cloudflare KV namespace
 * - Update wrangler.toml with generated IDs
 * - Run database migrations
 * - Generate .env.local files
 */

import * as readline from "readline";
import { execSync, spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

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

const runCommand = (
  command: string,
  options?: { cwd?: string; silent?: boolean }
): string => {
  try {
    const result = execSync(command, {
      cwd: options?.cwd,
      encoding: "utf-8",
      stdio: options?.silent ? "pipe" : "inherit",
    });
    return result?.toString() || "";
  } catch (error: any) {
    if (options?.silent) {
      return error.stdout?.toString() || "";
    }
    throw error;
  }
};

const checkWranglerAuth = (): boolean => {
  try {
    const result = spawnSync("npx", ["wrangler", "whoami"], {
      encoding: "utf-8",
      stdio: "pipe",
    });
    return !result.stdout.includes("Not logged in");
  } catch {
    return false;
  }
};

const extractId = (output: string, pattern: RegExp): string | null => {
  const match = output.match(pattern);
  return match ? match[1] : null;
};

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🏦  STASHTAB SETUP WIZARD                                   ║
║                                                               ║
║   This wizard will help you configure your neobank instance   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

async function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const apiDir = path.join(projectRoot, "apps", "api");
  const webDir = path.join(projectRoot, "apps", "web");

  // Step 1: Check prerequisites
  console.log("\n📋 Step 1: Checking prerequisites...\n");

  // Check if wrangler is authenticated
  console.log("  Checking Cloudflare authentication...");
  if (!checkWranglerAuth()) {
    console.log(
      "\n  ⚠️  You're not logged into Cloudflare. Running 'wrangler login'...\n"
    );
    runCommand("npx wrangler login");
  } else {
    console.log("  ✅ Cloudflare authenticated\n");
  }

  // Step 2: Collect Privy credentials
  console.log("📋 Step 2: Privy Configuration\n");
  console.log("  Get your credentials from https://dashboard.privy.io\n");

  const privyAppId = await question("  Enter your Privy App ID: ");
  const privyAppSecret = await question("  Enter your Privy App Secret: ");

  if (!privyAppId || !privyAppSecret) {
    console.log(
      "\n  ⚠️  Privy credentials are required. You can add them later to .env files."
    );
  }

  // Step 3: Create Cloudflare resources
  console.log("\n📋 Step 3: Creating Cloudflare resources...\n");

  let d1DatabaseId = "";
  let kvNamespaceId = "";

  // Create D1 database
  console.log("  Creating D1 database 'stashtab-db'...");
  try {
    const d1Output = runCommand(
      "npx wrangler d1 create stashtab-db 2>&1",
      { cwd: apiDir, silent: true }
    );

    // Extract database ID from output
    const idMatch = d1Output.match(/database_id\s*=\s*"([^"]+)"/);
    if (idMatch) {
      d1DatabaseId = idMatch[1];
      console.log(`  ✅ D1 database created: ${d1DatabaseId}\n`);
    } else if (d1Output.includes("already exists")) {
      console.log("  ℹ️  D1 database already exists\n");
      const useExisting = await question(
        "  Enter existing database_id (or press Enter to skip): "
      );
      d1DatabaseId = useExisting;
    } else {
      console.log("  ⚠️  Could not parse D1 database ID from output\n");
      console.log(d1Output);
    }
  } catch (error) {
    console.log("  ⚠️  Failed to create D1 database. You may need to create it manually.\n");
  }

  // Create KV namespace
  console.log("  Creating KV namespace 'CACHE'...");
  try {
    const kvOutput = runCommand(
      "npx wrangler kv:namespace create CACHE 2>&1",
      { cwd: apiDir, silent: true }
    );

    // Extract KV ID from output
    const kvMatch = kvOutput.match(/id\s*=\s*"([^"]+)"/);
    if (kvMatch) {
      kvNamespaceId = kvMatch[1];
      console.log(`  ✅ KV namespace created: ${kvNamespaceId}\n`);
    } else if (kvOutput.includes("already exists")) {
      console.log("  ℹ️  KV namespace already exists\n");
      const useExisting = await question(
        "  Enter existing KV namespace id (or press Enter to skip): "
      );
      kvNamespaceId = useExisting;
    } else {
      console.log("  ⚠️  Could not parse KV namespace ID from output\n");
    }
  } catch (error) {
    console.log("  ⚠️  Failed to create KV namespace. You may need to create it manually.\n");
  }

  // Step 4: Update wrangler.toml
  console.log("📋 Step 4: Updating wrangler.toml...\n");

  const wranglerPath = path.join(apiDir, "wrangler.toml");
  let wranglerContent = fs.readFileSync(wranglerPath, "utf-8");

  if (d1DatabaseId) {
    wranglerContent = wranglerContent.replace(
      /database_id\s*=\s*"YOUR_D1_DATABASE_ID"/,
      `database_id = "${d1DatabaseId}"`
    );
  }

  if (kvNamespaceId) {
    wranglerContent = wranglerContent.replace(
      /id\s*=\s*"YOUR_KV_NAMESPACE_ID"/,
      `id = "${kvNamespaceId}"`
    );
  }

  fs.writeFileSync(wranglerPath, wranglerContent);
  console.log("  ✅ wrangler.toml updated\n");

  // Step 5: Run database migrations
  console.log("📋 Step 5: Running database migrations...\n");

  if (d1DatabaseId) {
    try {
      console.log("  Applying migrations to local database...");
      runCommand(
        "npx wrangler d1 execute stashtab-db --local --file=migrations/0001_init.sql",
        { cwd: apiDir, silent: true }
      );
      console.log("  ✅ Local migrations applied\n");

      const applyRemote = await question(
        "  Apply migrations to remote database? (y/N): "
      );
      if (applyRemote.toLowerCase() === "y") {
        console.log("  Applying migrations to remote database...");
        runCommand(
          "npx wrangler d1 execute stashtab-db --file=migrations/0001_init.sql",
          { cwd: apiDir }
        );
        console.log("  ✅ Remote migrations applied\n");
      }
    } catch (error) {
      console.log("  ⚠️  Failed to run migrations. You can run them manually:\n");
      console.log("     cd apps/api && npx wrangler d1 execute stashtab-db --local --file=migrations/0001_init.sql\n");
    }
  }

  // Step 6: Generate .env files
  console.log("📋 Step 6: Generating environment files...\n");

  // API .dev.vars
  const devVarsContent = `# Privy Configuration
PRIVY_APP_ID=${privyAppId || "your-privy-app-id"}
PRIVY_APP_SECRET=${privyAppSecret || "your-privy-app-secret"}

# RPC URL for Base Sepolia (testnet)
RPC_URL=https://sepolia.base.org
`;

  fs.writeFileSync(path.join(apiDir, ".dev.vars"), devVarsContent);
  console.log("  ✅ Created apps/api/.dev.vars\n");

  // Web .env.local
  const envLocalContent = `# Privy
NEXT_PUBLIC_PRIVY_APP_ID=${privyAppId || "your-privy-app-id"}

# API URL (use localhost for development)
NEXT_PUBLIC_API_URL=http://localhost:8787

# Chain ID (84532 = Base Sepolia testnet)
NEXT_PUBLIC_CHAIN_ID=84532
`;

  fs.writeFileSync(path.join(webDir, ".env.local"), envLocalContent);
  console.log("  ✅ Created apps/web/.env.local\n");

  // Step 7: Set Cloudflare secrets
  console.log("📋 Step 7: Cloudflare Secrets\n");

  if (privyAppId && privyAppSecret) {
    const setSecrets = await question(
      "  Set Privy secrets in Cloudflare? (y/N): "
    );

    if (setSecrets.toLowerCase() === "y") {
      console.log("\n  Setting PRIVY_APP_ID...");
      try {
        execSync(`echo "${privyAppId}" | npx wrangler secret put PRIVY_APP_ID`, {
          cwd: apiDir,
          stdio: "inherit",
        });
      } catch {}

      console.log("  Setting PRIVY_APP_SECRET...");
      try {
        execSync(`echo "${privyAppSecret}" | npx wrangler secret put PRIVY_APP_SECRET`, {
          cwd: apiDir,
          stdio: "inherit",
        });
      } catch {}

      console.log("  Setting RPC_URL...");
      try {
        execSync(`echo "https://sepolia.base.org" | npx wrangler secret put RPC_URL`, {
          cwd: apiDir,
          stdio: "inherit",
        });
      } catch {}

      console.log("\n  ✅ Secrets configured\n");
    }
  }

  // Done!
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✅  SETUP COMPLETE!                                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Next steps:

  1. Start development:
     $ pnpm dev

  2. Open the app:
     - Frontend: http://localhost:3000
     - API: http://localhost:8787

  3. Configure Privy (if not done):
     - Go to https://dashboard.privy.io
     - Add http://localhost:3000 to allowed origins

  4. Deploy when ready:
     $ pnpm build
     $ cd apps/api && npx wrangler deploy
     $ cd apps/web && npx wrangler pages deploy .next

For more help, see docs/DEPLOY.md
`);

  rl.close();
}

main().catch((error) => {
  console.error("Setup failed:", error);
  rl.close();
  process.exit(1);
});

