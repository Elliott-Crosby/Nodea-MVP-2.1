#!/usr/bin/env node

/**
 * Vite Environment Variables Audit Script
 * 
 * This script specifically audits VITE_* environment variables for security
 * and ensures no secrets are exposed to the client.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Vite Environment Variables Audit');
console.log('===================================\n');

const issues = [];
const warnings = [];

/**
 * Patterns that indicate secrets or sensitive data
 */
const SECRET_PATTERNS = [
  /VITE_.*KEY/gi,
  /VITE_.*SECRET/gi,
  /VITE_.*TOKEN/gi,
  /VITE_.*PASSWORD/gi,
  /VITE_.*API_KEY/gi,
  /VITE_.*AUTH/gi,
  /VITE_.*CREDENTIAL/gi,
  /VITE_.*PRIVATE/gi,
  /VITE_.*SENSITIVE/gi,
  /VITE_.*CONFIDENTIAL/gi
];

/**
 * Safe patterns that are acceptable in VITE_*
 */
const SAFE_PATTERNS = [
  /VITE_.*URL/gi,
  /VITE_.*HOST/gi,
  /VITE_.*DOMAIN/gi,
  /VITE_.*PORT/gi,
  /VITE_.*VERSION/gi,
  /VITE_.*BUILD/gi,
  /VITE_.*ENV/gi,
  /VITE_.*MODE/gi,
  /VITE_.*PUBLIC/gi,
  /VITE_.*CLIENT/gi,
  /VITE_.*FRONTEND/gi,
  /VITE_.*APP/gi,
  /VITE_.*SITE/gi,
  /VITE_.*BASE/gi
];

/**
 * Scan a file for VITE_* environment variable usage
 */
function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  if (fs.statSync(filePath).isDirectory()) {
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
        scanFile(path.join(filePath, file));
      }
    });
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Find all VITE_* environment variable references
    const viteMatches = line.match(/import\.meta\.env\.VITE_[A-Z_]+/g);
    
    if (viteMatches) {
      viteMatches.forEach(match => {
        const variableName = match.replace('import.meta.env.', '');
        
        // Check if it looks like a secret
        const isSecret = SECRET_PATTERNS.some(pattern => pattern.test(variableName));
        const isSafe = SAFE_PATTERNS.some(pattern => pattern.test(variableName));
        
        if (isSecret) {
          issues.push(`🚨 SECRET IN VITE_*: ${filePath}:${index + 1} - ${variableName}`);
        } else if (isSafe) {
          console.log(`✅ Safe VITE_* usage: ${filePath}:${index + 1} - ${variableName}`);
        } else {
          warnings.push(`⚠️  Unknown VITE_* variable: ${filePath}:${index + 1} - ${variableName}`);
        }
      });
    }
  });
}

/**
 * Check for .env files that might contain VITE_* variables
 */
function checkEnvFiles() {
  console.log('\n📋 Checking .env files...');
  
  const envFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    '.env.test'
  ];
  
  envFiles.forEach(envFile => {
    const envPath = path.join(__dirname, '..', envFile);
    
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.startsWith('VITE_')) {
          const [variableName] = line.split('=');
          
          const isSecret = SECRET_PATTERNS.some(pattern => pattern.test(variableName));
          const isSafe = SAFE_PATTERNS.some(pattern => pattern.test(variableName));
          
          if (isSecret) {
            issues.push(`🚨 SECRET IN .env: ${envFile}:${index + 1} - ${variableName}`);
          } else if (isSafe) {
            console.log(`✅ Safe VITE_* in .env: ${envFile}:${index + 1} - ${variableName}`);
          } else {
            warnings.push(`⚠️  Unknown VITE_* in .env: ${envFile}:${index + 1} - ${variableName}`);
          }
        }
      });
    }
  });
}

/**
 * Check for hardcoded secrets in source code
 */
function checkHardcodedSecrets() {
  console.log('\n📋 Checking for hardcoded secrets...');
  
  const files = [
    'src/main.tsx',
    'src/App.tsx',
    'src/components',
    'src/pages',
    'src/lib'
  ];
  
  const secretPatterns = [
    /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/gi,
    /secret\s*[:=]\s*['"][^'"]{20,}['"]/gi,
    /token\s*[:=]\s*['"][^'"]{20,}['"]/gi,
    /password\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    /sk-[a-zA-Z0-9]{20,}/gi,
    /pk_[a-zA-Z0-9]{20,}/gi
  ];
  
  function scanFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    if (fs.statSync(filePath).isDirectory()) {
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
          scanFile(path.join(filePath, file));
        }
      });
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      secretPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push(`🚨 HARDCODED SECRET: ${filePath}:${index + 1} - ${line.trim()}`);
        }
      });
    });
  }
  
  files.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    scanFile(fullPath);
  });
}

/**
 * Generate security recommendations
 */
function generateRecommendations() {
  console.log('\n📋 Security Recommendations:');
  console.log('============================');
  
  console.log('\n✅ Safe VITE_* Variables:');
  console.log('  - VITE_CONVEX_URL (public deployment URL)');
  console.log('  - VITE_APP_VERSION (build version)');
  console.log('  - VITE_APP_NAME (application name)');
  console.log('  - VITE_PUBLIC_API_URL (public API endpoint)');
  console.log('  - VITE_FEATURE_FLAGS (feature toggles)');
  
  console.log('\n❌ Never Use VITE_* For:');
  console.log('  - API keys or secrets');
  console.log('  - Authentication tokens');
  console.log('  - Database credentials');
  console.log('  - Private keys');
  console.log('  - Sensitive configuration');
  
  console.log('\n🔒 Best Practices:');
  console.log('  1. Keep all secrets server-side only');
  console.log('  2. Use VITE_* only for public configuration');
  console.log('  3. Validate environment variables at startup');
  console.log('  4. Document all VITE_* variables');
  console.log('  5. Regular security audits');
  
  console.log('\n🛡️ Security Measures:');
  console.log('  - Content Security Policy (CSP)');
  console.log('  - Input sanitization with DOMPurify');
  console.log('  - Security headers in Vite config');
  console.log('  - No service workers (reduced attack surface)');
  console.log('  - Structured logging without sensitive data');
}

/**
 * Run the audit
 */
async function runAudit() {
  try {
    // Scan source files
    const files = [
      'src/main.tsx',
      'src/App.tsx',
      'src/components',
      'src/pages',
      'src/lib'
    ];
    
    files.forEach(file => {
      const fullPath = path.join(__dirname, '..', file);
      scanFile(fullPath);
    });
    
    // Check .env files
    checkEnvFiles();
    
    // Check for hardcoded secrets
    checkHardcodedSecrets();
    
    console.log('\n📊 Audit Results');
    console.log('================');
    
    if (issues.length === 0) {
      console.log('✅ No critical security issues found!');
    } else {
      console.log(`🚨 ${issues.length} critical security issues found:`);
      issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log(`\n⚠️  ${warnings.length} warnings:`);
      warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    generateRecommendations();
    
    if (issues.length > 0) {
      console.log('\n❌ Audit failed due to security issues');
      process.exit(1);
    } else {
      console.log('\n✅ Audit passed - no security issues found');
    }
    
  } catch (error) {
    console.error('\n❌ Audit failed:', error.message);
    process.exit(1);
  }
}

// Run the audit
runAudit();
