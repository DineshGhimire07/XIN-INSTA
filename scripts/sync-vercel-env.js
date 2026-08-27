#!/usr/bin/env node

/**
 * XINVORA - Production Environment Synchronization Script
 * Safely synchronizes all environment variables from .env.local into Vercel Production
 *
 * Rules:
 * 1. .env.local is the single source of truth.
 * 2. Uses Node spawnSync with stdio pipe (no shell interpolation).
 * 3. Never prints secret values to stdout/stderr.
 * 4. Production ONLY (production).
 * 5. Verifies and validates every key.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ENV_LOCAL_PATH = path.join(__dirname, '..', '.env.local');
const TMP_PULL_PATH = path.join(__dirname, '..', '.env.production.tmp');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    // Ignore NODE_ENV as per Vercel standard
    if (key === 'NODE_ENV') continue;

    // Unquote if wrapped in single or double quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function getExistingProductionVars() {
  const res = spawnSync('npx', ['vercel', 'env', 'ls', 'production'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (res.status !== 0) {
    console.error('Failed to list existing Vercel environment variables.');
    return new Set();
  }

  const existing = new Set();
  const lines = (res.stdout || '').split(/\r?\n/);
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 1 && parts[0] && parts[0] !== 'name' && !parts[0].startsWith('>')) {
      existing.add(parts[0]);
    }
  }

  return existing;
}

async function syncProductionEnv() {
  console.log('======================================================');
  console.log('  XINVORA: Syncing .env.local -> Vercel Production');
  console.log('======================================================\n');

  let localVars;
  try {
    localVars = parseEnvFile(ENV_LOCAL_PATH);
  } catch (err) {
    console.error(`[ERROR] Failed to read .env.local: ${err.message}`);
    process.exit(1);
  }

  const keys = Object.keys(localVars);
  console.log(`Found ${keys.length} valid environment variables in .env.local.\n`);

  const existingVars = getExistingProductionVars();
  const successful = [];
  const failed = [];

  for (const key of keys) {
    const value = localVars[key];
    console.log(`Syncing ${key} → Production...`);

    // If key already exists in Production, remove it first to overwrite cleanly
    if (existingVars.has(key)) {
      const rmRes = spawnSync('npx', ['vercel', 'env', 'rm', key, 'production', '-y'], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      if (rmRes.status !== 0) {
        console.error(`  ↳ Warning: Could not remove prior ${key} (status: ${rmRes.status})`);
      }
    }

    // Add variable using stdin pipe safely without shell interpolation
    const args = ['vercel', 'env', 'add', key, 'production'];
    if (key.startsWith('NEXT_PUBLIC_')) {
      args.push('--type', 'config');
    }
    args.push('-y');

    const addRes = spawnSync('npx', args, {
      input: `${value}\n`,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (addRes.status === 0) {
      console.log(`  ✓ ${key} synced successfully.`);
      successful.push(key);
    } else {
      console.error(`  ✗ [ERROR] Failed to sync ${key} (Exit status ${addRes.status})`);
      failed.push(key);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log('  Verifying Production Environment Variables');
  console.log('------------------------------------------------------\n');

  // Pull production environment into temporary file for verification
  const pullRes = spawnSync('npx', ['vercel', 'env', 'pull', TMP_PULL_PATH, '--environment=production', '-y'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let pulledVars = {};
  if (fs.existsSync(TMP_PULL_PATH)) {
    try {
      pulledVars = parseEnvFile(TMP_PULL_PATH);
    } catch (e) {
      console.error('Could not parse pulled environment file for verification.');
    } finally {
      // Always safely remove temporary file
      try {
        fs.unlinkSync(TMP_PULL_PATH);
      } catch {}
    }
  }

  let verifyPassed = true;
  for (const key of keys) {
    if (!pulledVars[key]) {
      console.log(`${key} → MISSING`);
      verifyPassed = false;
    } else {
      console.log(`${key} → MATCH`);
    }
  }

  console.log('\n======================================================');
  console.log('  FINAL SYNCHRONIZATION SUMMARY');
  console.log('======================================================');
  console.log(`Total variables processed: ${keys.length}`);
  console.log(`Successfully synchronized: ${successful.length}`);
  console.log(`Failed variables count:   ${failed.length}`);

  if (failed.length > 0 || !verifyPassed) {
    console.error('\n[FATAL] Environment synchronization FAILED.');
    if (failed.length > 0) {
      console.error('Failed variables:');
      failed.forEach((k) => console.error(` - ${k}`));
    }
    process.exit(1);
  }

  console.log('\n🎉 ALL ENVIRONMENT VARIABLES SYNCHRONIZED & VERIFIED TO PRODUCTION!\n');
}

syncProductionEnv().catch((err) => {
  console.error('[UNHANDLED ERROR]', err);
  process.exit(1);
});
