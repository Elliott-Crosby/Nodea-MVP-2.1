#!/bin/bash

# Deployment Rotation Script for Nodea MVP 2.1
# This script creates a new deployment with rotated keys

set -e

echo "🚀 Nodea Deployment Rotation Script"
echo "===================================="

# Configuration
NEW_DEPLOYMENT_NAME="secure-nodea-$(date +%Y%m%d-%H%M%S)"
CURRENT_DEPLOYMENT="tacit-wombat-905"

echo "📋 Current deployment: $CURRENT_DEPLOYMENT"
echo "🆕 New deployment name: $NEW_DEPLOYMENT_NAME"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

# Check if Convex is initialized
if [ ! -d "convex" ]; then
    echo "❌ Error: Convex not initialized"
    exit 1
fi

echo ""
echo "🔐 Step 1: Generate new keys"
echo "----------------------------"

# Run key rotation script
node scripts/rotate-keys.js

if [ $? -ne 0 ]; then
    echo "❌ Key rotation failed"
    exit 1
fi

echo ""
echo "🔑 Step 2: Get new keys"
echo "----------------------"

# Get the latest generated keys
LATEST_JWT_PRIVATE=$(find rotated-keys -name "jwt-private-key-*.pem" -type f | sort | tail -1)
LATEST_JWKS=$(find rotated-keys -name "jwks-*.json" -type f | sort | tail -1)

if [ ! -f "$LATEST_JWT_PRIVATE" ] || [ ! -f "$LATEST_JWKS" ]; then
    echo "❌ Error: Generated keys not found"
    exit 1
fi

echo "📁 JWT Private Key: $LATEST_JWT_PRIVATE"
echo "📁 JWKS: $LATEST_JWKS"

# Read the keys
JWT_PRIVATE_KEY=$(cat "$LATEST_JWT_PRIVATE" | tr '\n' '\\n')
JWKS_CONTENT=$(cat "$LATEST_JWKS")

echo ""
echo "🆕 Step 3: Create new deployment"
echo "-------------------------------"

# Create new deployment
echo "Creating new deployment: $NEW_DEPLOYMENT_NAME"
npx convex deploy --prod --name "$NEW_DEPLOYMENT_NAME"

if [ $? -ne 0 ]; then
    echo "❌ Deployment creation failed"
    exit 1
fi

echo ""
echo "🔧 Step 4: Set environment variables"
echo "-----------------------------------"

# Set environment variables for new deployment
echo "Setting CONVEX_OPENAI_API_KEY..."
read -p "Enter new OpenAI API key: " NEW_OPENAI_KEY

echo "Setting JWT_PRIVATE_KEY..."
npx convex env set JWT_PRIVATE_KEY "$JWT_PRIVATE_KEY"

echo "Setting JWKS..."
npx convex env set JWKS "$JWKS_CONTENT"

echo "Setting CONVEX_OPENAI_API_KEY..."
npx convex env set CONVEX_OPENAI_API_KEY "$NEW_OPENAI_KEY"

echo ""
echo "🧪 Step 5: Test new deployment"
echo "-----------------------------"

# Test the deployment
echo "Testing new deployment..."
npx convex run boards:listBoards

if [ $? -ne 0 ]; then
    echo "❌ Deployment test failed"
    echo "🔧 You may need to fix issues before proceeding"
    exit 1
fi

echo ""
echo "✅ Step 6: Deployment rotation complete!"
echo "========================================"

echo "🎉 New deployment created successfully!"
echo "📊 Deployment name: $NEW_DEPLOYMENT_NAME"
echo "🌐 Dashboard: https://dashboard.convex.dev/d/$NEW_DEPLOYMENT_NAME"

echo ""
echo "📋 Next Steps:"
echo "1. Test all application functionality"
echo "2. Update frontend to use new deployment URL"
echo "3. Monitor for 24-48 hours"
echo "4. Revoke old deployment after confirming new one works"
echo "5. Update documentation with new deployment info"

echo ""
echo "⚠️  Security Notes:"
echo "- Old deployment: $CURRENT_DEPLOYMENT"
echo "- New deployment: $NEW_DEPLOYMENT_NAME"
echo "- Keep old deployment active until new one is verified"
echo "- Monitor audit logs for any issues"
echo "- Force user re-authentication"

echo ""
echo "🔗 Useful Commands:"
echo "npx convex dashboard  # Open new deployment dashboard"
echo "npx convex env list   # List environment variables"
echo "npx convex logs       # View deployment logs"

echo ""
echo "🎯 Deployment rotation completed successfully!"
