#!/bin/bash

# TypeDoc Documentation Generator Script
# This script generates TypeDoc documentation for the @knocklabs/javascript repository

set -e

echo "🚀 Starting TypeDoc documentation generation..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}ℹ️  Cleaning previous documentation...${NC}"
yarn docs:clean

echo -e "${BLUE}ℹ️  Generating TypeDoc documentation...${NC}"
yarn docs:generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Documentation generated successfully!${NC}"
    echo -e "${GREEN}📁 Documentation location: ./_typedocs${NC}"
    echo ""
    echo -e "${YELLOW}📖 To view the documentation:${NC}"
    echo -e "   - Open ./_typedocs/index.mdx to see the main index"
    echo -e "   - Browse ./_typedocs/globals.mdx for the full API reference"
    echo -e "   - All files are in MDX format for easy integration with documentation sites"
    echo ""
    echo -e "${YELLOW}🔗 Quick links:${NC}"
    echo -e "   - Main index: file://$(pwd)/_typedocs/index.mdx"
    echo -e "   - API reference: file://$(pwd)/_typedocs/globals.mdx"
else
    echo -e "${RED}❌ Documentation generation failed!${NC}"
    exit 1
fi