# TypeDoc Setup Summary (Clerk Style)

This document summarizes the TypeDoc setup that has been configured for the `@knocklabs/javascript` repository, **modeled after the Clerk JavaScript repository configuration**.

## What Was Set Up

### 1. Dependencies Installed
- `typedoc` - Core TypeDoc library
- `typedoc-plugin-markdown` - Plugin to generate Markdown output 
- `typedoc-plugin-frontmatter` - Plugin to add frontmatter to generated files for better static site integration

### 2. Configuration Files (Clerk Style)
Created `typedoc.config.mjs` (JavaScript configuration) with the following key settings:
- **Entry points**: Multiple packages (client, expo, react, react-core, react-native, types)
- **Dual output**: Both HTML and MDX formats
- **HTML output**: `./_typedocs` directory for local viewing
- **MDX output**: `./_typedocs-markdown` directory for documentation sites
- **Monorepo support**: Automatically discovers and documents all packages
- **Error handling**: Skip type checking errors to allow documentation generation even with build issues
- **JSX highlighting**: Full support for TypeScript, JavaScript, JSX, and TSX code blocks

### 3. Dual Configuration Setup
- **`typedoc.config.mjs`** - Main configuration for HTML output (similar to Clerk's approach)
- **`typedoc.markdown.config.mjs`** - Extended configuration for MDX output with frontmatter

### 4. NPM Scripts (Clerk Style)
Updated scripts in `package.json`:
- `docs` - Runs TypeDoc with default (HTML) configuration
- `docs:html` - Explicitly generates HTML documentation  
- `docs:markdown` - Generates MDX documentation with frontmatter
- `docs:build` - Generates both HTML and MDX documentation
- `docs:watch` - Runs TypeDoc in watch mode for development

### 5. Convenience Script
Updated `generate-docs.sh` to support the new dual-output approach:
- Generates both HTML and MDX documentation  
- Provides colored output and progress indicators
- Shows helpful information about both output directories
- Includes direct file links for easy access

### 6. Enhanced Documentation
Added comprehensive TypeDoc comments to key hooks:
- **`useGuide`** - Hook for retrieving individual guides with detailed examples
- **`useGuides`** - Hook for retrieving multiple guides with filtering examples
- Both include full JSDoc comments with parameter descriptions, return types, examples, and TypeScript generics documentation

## Usage

### Quick Start
```bash
# Generate documentation with the convenience script
./generate-docs.sh

# Or use yarn commands directly
yarn docs:build
```

### Generated Files
- `_typedocs/index.mdx` - Main documentation index
- `_typedocs/globals.mdx` - Complete API reference
- `_typedocs/README.md` - Documentation about the generated files
- `_typedocs/_media/` - Static assets

## Features

### MDX Output
The documentation is generated in MDX format, making it compatible with:
- Docusaurus
- Next.js with MDX support
- Gatsby
- Any static site generator supporting MDX

### Comprehensive Coverage
The generated documentation includes:
- All exported functions, hooks, and interfaces
- Type parameters and generic constraints
- Parameter descriptions with types
- Return type documentation
- Real-world usage examples
- GitHub source links for each item

### Example Documentation Quality
The `useGuide` hook documentation includes:
- Detailed description of functionality
- TypeScript generic parameter documentation
- Parameter documentation with types
- Return value descriptions
- Multiple usage examples showing different scenarios
- Error handling documentation

## Integration Tips

1. **Copy to Documentation Site**: Copy MDX files to your docs directory
2. **Frontmatter**: Files include layout hints for easy integration
3. **Source Links**: GitHub links connect docs back to source code
4. **Type Safety**: All TypeScript types are preserved and documented

## Files Created/Modified

### New Files
- `typedoc.json` - TypeDoc configuration
- `generate-docs.sh` - Convenience script
- `_typedocs/` - Generated documentation directory

### Modified Files
- `package.json` - Added documentation scripts and dependencies
- `packages/react-core/src/modules/guide/hooks/useGuide.ts` - Enhanced documentation
- `packages/react-core/src/modules/guide/hooks/useGuides.ts` - Enhanced documentation

This setup provides a solid foundation for maintaining comprehensive API documentation that stays in sync with your codebase.