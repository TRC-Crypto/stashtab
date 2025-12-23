#!/usr/bin/env tsx
/**
 * Template Generator
 *
 * Creates a new Stashtab project from a template.
 *
 * Usage:
 *   pnpm create-stashtab-app my-neobank --template crypto-only
 *   pnpm create-stashtab-app my-neobank --template saas-ready
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const templates = {
  'crypto-only': {
    name: 'Crypto-Only',
    description: 'Minimal configuration without fiat or KYC',
    path: 'templates/crypto-only',
  },
  'saas-ready': {
    name: 'SaaS-Ready',
    description: 'Full-featured multi-tenant configuration',
    path: 'templates/saas-ready',
  },
  compliant: {
    name: 'Compliant',
    description: 'Full compliance with KYC and fiat support',
    path: 'examples/compliant',
  },
};

function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];
  const templateFlagIndex = args.indexOf('--template');
  const templateName = templateFlagIndex !== -1 ? args[templateFlagIndex + 1] : 'crypto-only';

  if (!projectName) {
    console.error('Error: Project name is required');
    console.log('Usage: pnpm create-stashtab-app <project-name> [--template <template-name>]');
    console.log('\nAvailable templates:');
    Object.entries(templates).forEach(([key, template]) => {
      console.log(`  ${key.padEnd(20)} - ${template.description}`);
    });
    process.exit(1);
  }

  if (!templates[templateName as keyof typeof templates]) {
    console.error(`Error: Unknown template "${templateName}"`);
    console.log('\nAvailable templates:');
    Object.entries(templates).forEach(([key, template]) => {
      console.log(`  ${key.padEnd(20)} - ${template.description}`);
    });
    process.exit(1);
  }

  const template = templates[templateName as keyof typeof templates];
  const templatePath = path.resolve(__dirname, '..', template.path);
  const projectPath = path.resolve(process.cwd(), projectName);

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🚀  Creating Stashtab Project                                  ║
║                                                                  ║
║   Template: ${template.name.padEnd(47)}║
║   Project: ${projectName.padEnd(48)}║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);

  // Check if project directory already exists
  if (fs.existsSync(projectPath)) {
    console.error(`Error: Directory "${projectName}" already exists`);
    process.exit(1);
  }

  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template "${templateName}" not found at ${templatePath}`);
    process.exit(1);
  }

  try {
    // Clone the repository (simplified - in real implementation, would clone from GitHub)
    console.log('📦 Cloning Stashtab repository...');
    execSync(`git clone https://github.com/TRC-Crypto/stashtab.git ${projectName}`, {
      stdio: 'inherit',
    });

    // Copy template config
    console.log(`📋 Applying "${template.name}" template...`);
    const templateConfigPath = path.join(templatePath, 'stashtab.config.ts');
    if (fs.existsSync(templateConfigPath)) {
      const projectConfigPath = path.join(projectPath, 'stashtab.config.ts');
      fs.copyFileSync(templateConfigPath, projectConfigPath);
      console.log('  ✅ Template configuration applied');
    }

    // Install dependencies
    console.log('📥 Installing dependencies...');
    execSync('pnpm install', {
      cwd: projectPath,
      stdio: 'inherit',
    });

    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ✅  Project Created Successfully!                              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

Next steps:

  1. Navigate to your project:
     cd ${projectName}

  2. Configure your environment:
     pnpm setup

  3. Start development:
     pnpm dev

  4. Deploy to production:
     pnpm deploy:auto

For more help, see:
  - docs/QUICKSTART.md
  - docs/DEPLOY.md

Happy building! 🚀
`);
  } catch (error) {
    console.error('Error creating project:', error);
    // Cleanup on error
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
    process.exit(1);
  }
}

main();
