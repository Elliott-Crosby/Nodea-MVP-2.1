#!/usr/bin/env node

/**
 * Token Rotation Script for Nodea MVP 2.1
 * 
 * This script helps rotate API keys and JWT tokens for security.
 * Run with: node scripts/rotate-keys.js
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Nodea Token Rotation Script');
console.log('================================');

// Generate new JWT key pair
function generateJWTKeys() {
  console.log('\n📝 Generating new JWT key pair...');
  
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Generate JWKS from public key
  const jwk = crypto.createPublicKey(publicKey);
  const jwkExport = jwk.export({ format: 'jwk' });
  
  const jwks = {
    keys: [{
      kty: jwkExport.kty,
      use: "sig",
      kid: crypto.randomUUID(),
      n: jwkExport.n,
      e: jwkExport.e,
      alg: "RS256"
    }]
  };

  return {
    privateKey,
    publicKey,
    jwks: JSON.stringify(jwks, null, 2)
  };
}

// Generate new API key (placeholder)
function generateAPIKey() {
  console.log('\n🔑 Generating new API key placeholder...');
  
  // This is just a placeholder - real API keys must be generated from the service provider
  const prefix = 'sk-proj-';
  const randomBytes = crypto.randomBytes(32).toString('base64url');
  return prefix + randomBytes;
}

// Main rotation function
async function rotateKeys() {
  try {
    console.log('\n🚀 Starting key rotation process...');
    
    // Generate new keys
    const jwtKeys = generateJWTKeys();
    const newAPIKey = generateAPIKey();
    
    // Create output directory
    const outputDir = path.join(__dirname, '..', 'rotated-keys');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save keys to files (for manual review)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    fs.writeFileSync(
      path.join(outputDir, `jwt-private-key-${timestamp}.pem`),
      jwtKeys.privateKey
    );
    
    fs.writeFileSync(
      path.join(outputDir, `jwt-public-key-${timestamp}.pem`),
      jwtKeys.publicKey
    );
    
    fs.writeFileSync(
      path.join(outputDir, `jwks-${timestamp}.json`),
      jwtKeys.jwks
    );
    
    fs.writeFileSync(
      path.join(outputDir, `api-key-${timestamp}.txt`),
      newAPIKey
    );
    
    console.log('\n✅ Keys generated successfully!');
    console.log(`📁 Keys saved to: ${outputDir}`);
    
    // Display next steps
    console.log('\n📋 Next Steps:');
    console.log('1. Review the generated keys in the output directory');
    console.log('2. Generate a real OpenAI API key from https://platform.openai.com/api-keys');
    console.log('3. Update Convex environment variables:');
    console.log(`   npx convex env set CONVEX_OPENAI_API_KEY "your-real-openai-key"`);
    console.log(`   npx convex env set JWT_PRIVATE_KEY "${jwtKeys.privateKey.replace(/\n/g, '\\n')}"`);
    console.log(`   npx convex env set JWKS '${jwtKeys.jwks}'`);
    console.log('4. Test the application');
    console.log('5. Revoke old keys after confirming new ones work');
    
    // Security warnings
    console.log('\n⚠️  Security Warnings:');
    console.log('- Keep the generated keys secure');
    console.log('- Don\'t commit keys to version control');
    console.log('- Rotate keys regularly (every 90 days)');
    console.log('- Monitor for unauthorized access');
    console.log('- Force user re-authentication after JWT rotation');
    
  } catch (error) {
    console.error('\n❌ Error during key rotation:', error.message);
    process.exit(1);
  }
}

// Run the rotation
rotateKeys();
