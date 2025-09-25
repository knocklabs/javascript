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

echo -e "${BLUE}ℹ️  Generating TypeDoc documentation...${NC}"
yarn docs:build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Documentation generated successfully!${NC}"
    echo -e "${GREEN}📁 HTML Documentation: ./_typedocs${NC}"
    echo -e "${GREEN}📁 Markdown Documentation: ./_typedocs-markdown${NC}"
    echo ""
    echo -e "${YELLOW}📖 To view the documentation:${NC}"
    echo -e "   HTML (for local viewing):"
    echo -e "   - Open ./_typedocs/index.html in your browser"
    echo -e "   - Browse package modules in ./_typedocs/modules/"
    echo ""
    echo -e "   Markdown/MDX (for documentation sites):"
    echo -e "   - Main index: ./_typedocs-markdown/index.mdx"
    echo -e "   - Package modules: ./_typedocs-markdown/[package-name]/src/"
    echo -e "   - All files have frontmatter for easy integration"
    echo ""
    echo -e "${YELLOW}🔗 Quick links:${NC}"
    echo -e "   - HTML main page: file://$(pwd)/_typedocs/index.html"
    echo -e "   - MDX main index: file://$(pwd)/_typedocs-markdown/index.mdx"
else
    echo -e "${RED}❌ Documentation generation failed!${NC}"
    exit 1
fi