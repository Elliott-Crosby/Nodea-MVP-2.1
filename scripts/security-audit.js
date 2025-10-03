#!/usr/bin/env node

/**
 * Security Audit Script for Nodea MVP 2.1
 * 
 * This script audits the front-end code for common security vulnerabilities
 * and ensures Vite best practices are followed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Nodea Security Audit');
console.log('========================\n');

const issues = [];
const warnings = [];

/**
 * Check for secrets in VITE_* environment variables
 */
function auditEnvironmentVariables() {
  console.log('📋 Checking environment variables...');
  
  const files = [
    'src/main.tsx',
    'src/App.tsx',
    'src/components',
    'src/pages',
    'src/lib'
  ];
  
  const viteEnvPattern = /import\.meta\.env\.VITE_/g;
  const secretPatterns = [
    /VITE_.*KEY/gi,
    /VITE_.*SECRET/gi,
    /VITE_.*TOKEN/gi,
    /VITE_.*PASSWORD/gi,
    /VITE_.*API_KEY/gi,
    /VITE_.*AUTH/gi
  ];
  
  function scanFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    if (fs.statSync(filePath).isDirectory()) {
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
          scanFile(path.join(filePath, file));
        }
      });
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for VITE_ environment variables
    const viteMatches = content.match(viteEnvPattern);
    if (viteMatches) {
      viteMatches.forEach(match => {
        // Check if it looks like a secret
        const isSecret = secretPatterns.some(pattern => pattern.test(match));
        if (isSecret) {
          issues.push(`🚨 SECRET IN VITE_*: ${filePath} - ${match}`);
        } else {
          console.log(`✅ Safe VITE_* usage: ${filePath} - ${match}`);
        }
      });
    }
  }
  
  files.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    scanFile(fullPath);
  });
}

/**
 * Check for dangerouslySetInnerHTML usage
 */
function auditDangerouslySetInnerHTML() {
  console.log('\n📋 Checking dangerouslySetInnerHTML usage...');
  
  const files = [
    'src/components',
    'src/pages',
    'src/lib'
  ];
  
  const dangerousPattern = /dangerouslySetInnerHTML/gi;
  
  function scanFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    if (fs.statSync(filePath).isDirectory()) {
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
          scanFile(path.join(filePath, file));
        }
      });
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (dangerousPattern.test(content)) {
      // Check if it's properly sanitized
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (dangerousPattern.test(line)) {
          // Look for sanitization in nearby lines
          const nearbyLines = lines.slice(Math.max(0, index - 5), index + 5);
          const hasSanitization = nearbyLines.some(l => 
            l.includes('sanitize') || l.includes('DOMPurify') || l.includes('purify')
          );
          
          if (hasSanitization) {
            console.log(`✅ Properly sanitized: ${filePath}:${index + 1}`);
          } else {
            issues.push(`🚨 UNSANITIZED dangerouslySetInnerHTML: ${filePath}:${index + 1}`);
          }
        }
      });
    }
  }
  
  files.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    scanFile(fullPath);
  });
}

/**
 * Check for service worker configuration
 */
function auditServiceWorkers() {
  console.log('\n📋 Checking service worker configuration...');
  
  const serviceWorkerFiles = [
    'public/sw.js',
    'public/service-worker.js',
    'src/sw.js',
    'src/service-worker.js'
  ];
  
  const hasServiceWorker = serviceWorkerFiles.some(file => {
    const fullPath = path.join(__dirname, '..', file);
    return fs.existsSync(fullPath);
  });
  
  if (hasServiceWorker) {
    warnings.push('⚠️  Service worker detected - ensure narrow scope and no auth route caching');
    
    serviceWorkerFiles.forEach(file => {
      const fullPath = path.join(__dirname, '..', file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for dangerous patterns
        if (content.includes('caches.match') && !content.includes('public')) {
          issues.push(`🚨 Service worker may cache authenticated routes: ${file}`);
        }
        
        if (content.includes('fetch') && !content.includes('scope')) {
          warnings.push(`⚠️  Service worker scope not explicitly defined: ${file}`);
        }
      }
    });
  } else {
    console.log('✅ No service workers found - reduced attack surface');
  }
}

/**
 * Check Vite configuration
 */
function auditViteConfig() {
  console.log('\n📋 Checking Vite configuration...');
  
  const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
  
  if (!fs.existsSync(viteConfigPath)) {
    issues.push('🚨 vite.config.ts not found');
    return;
  }
  
  const content = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Check for security headers
  const securityHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
    'Permissions-Policy'
  ];
  
  securityHeaders.forEach(header => {
    if (content.includes(header)) {
      console.log(`✅ Security header configured: ${header}`);
    } else {
      warnings.push(`⚠️  Security header missing: ${header}`);
    }
  });
  
  // Check for dangerous configurations
  if (content.includes('define:') && content.includes('process.env')) {
    issues.push('🚨 process.env usage in Vite config may expose secrets');
  }
}

/**
 * Check package.json for security
 */
function auditPackageJson() {
  console.log('\n📋 Checking package.json...');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    issues.push('🚨 package.json not found');
    return;
  }
  
  const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check for security-related dependencies
  const securityDeps = ['dompurify', 'helmet', 'cors'];
  securityDeps.forEach(dep => {
    if (content.dependencies?.[dep] || content.devDependencies?.[dep]) {
      console.log(`✅ Security dependency found: ${dep}`);
    }
  });
  
  // Check for vulnerable dependencies
  if (content.dependencies?.['react'] && content.dependencies['react'].includes('^')) {
    warnings.push('⚠️  React version not pinned - consider exact version');
  }
}

/**
 * Check HTML for security headers
 */
function auditHtmlSecurity() {
  console.log('\n📋 Checking HTML security...');
  
  const htmlPath = path.join(__dirname, '..', 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    issues.push('🚨 index.html not found');
    return;
  }
  
  const content = fs.readFileSync(htmlPath, 'utf8');
  
  // Check for CSP
  if (content.includes('Content-Security-Policy')) {
    console.log('✅ Content Security Policy found');
  } else {
    issues.push('🚨 Content Security Policy missing');
  }
  
  // Check for security meta tags
  const securityMetaTags = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
    'Permissions-Policy'
  ];
  
  securityMetaTags.forEach(tag => {
    if (content.includes(tag)) {
      console.log(`✅ Security meta tag found: ${tag}`);
    } else {
      warnings.push(`⚠️  Security meta tag missing: ${tag}`);
    }
  });
}

/**
 * Run all audits
 */
async function runAudit() {
  try {
    auditEnvironmentVariables();
    auditDangerouslySetInnerHTML();
    auditServiceWorkers();
    auditViteConfig();
    auditPackageJson();
    auditHtmlSecurity();
    
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
    
    console.log('\n📋 Recommendations:');
    console.log('1. Review all VITE_* environment variables');
    console.log('2. Ensure all user content is sanitized');
    console.log('3. Configure service workers with narrow scope');
    console.log('4. Keep security headers up to date');
    console.log('5. Regular dependency updates');
    
    if (issues.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Audit failed:', error.message);
    process.exit(1);
  }
}

// Run the audit
runAudit();
