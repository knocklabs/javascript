# TypeDoc Setup - Clerk JavaScript Repository Style

This repository now uses a TypeDoc configuration modeled after the [Clerk JavaScript repository](https://github.com/clerk/javascript), providing enterprise-grade documentation generation for the monorepo.

## 🎯 Key Features

### Clerk-Style Configuration
- **`typedoc.config.mjs`** - JavaScript-based configuration (ES modules)
- **Monorepo Support** - Automatically documents multiple packages
- **Dual Output** - Both HTML and MDX formats for different use cases
- **Enterprise-Grade** - Robust error handling and skip type checking for unbuilt packages

### Modern Tooling
- **MDX Output** - Ready for Docusaurus, Next.js, and other modern documentation sites
- **Frontmatter** - Automatic generation of YAML frontmatter for static site generators
- **JSX Highlighting** - Full syntax highlighting for TypeScript, JavaScript, JSX, and TSX
- **Source Linking** - Direct links to GitHub source code for each documented item

## 📁 File Structure

```
/workspace/
├── typedoc.config.mjs              # Main HTML configuration (Clerk style)
├── typedoc.markdown.config.mjs     # MDX configuration with frontmatter
├── generate-docs.sh                # Convenience script
├── _typedocs/                      # HTML documentation output
│   ├── index.html                  # Main HTML entry point
│   └── modules/                    # Package-specific documentation
└── _typedocs-markdown/             # MDX documentation output
    ├── index.mdx                   # Main MDX entry point
    ├── client/src/                 # @knocklabs/client documentation
    ├── expo/src/                   # @knocklabs/expo documentation
    ├── react/src/                  # @knocklabs/react documentation
    ├── react-core/src/             # @knocklabs/react-core documentation
    └── react-native/src/           # @knocklabs/react-native documentation
```

## 🚀 Usage

### Quick Start
```bash
# Generate both HTML and MDX documentation
./generate-docs.sh

# Or use yarn commands directly
yarn docs:build
```

### Individual Commands
```bash
# Generate HTML documentation only
yarn docs:html

# Generate MDX documentation only  
yarn docs:markdown

# Watch mode for development
yarn docs:watch
```

## 📖 Documentation Outputs

### HTML Documentation (`_typedocs/`)
- **Purpose**: Local viewing and development
- **Entry Point**: `_typedocs/index.html`
- **Features**: 
  - Interactive navigation
  - Search functionality
  - Dark/light theme toggle
  - Responsive design

### MDX Documentation (`_typedocs-markdown/`)
- **Purpose**: Integration with documentation sites
- **Entry Point**: `_typedocs-markdown/index.mdx`
- **Features**:
  - YAML frontmatter for metadata
  - Cross-references between packages
  - Ready for Docusaurus/Next.js/Gatsby
  - Hierarchical file structure

## 🔧 Configuration Details

### Main Configuration (`typedoc.config.mjs`)
```javascript
export default {
  entryPoints: [
    './packages/client/src/index.ts',
    './packages/expo/src/index.ts', 
    './packages/react/src/index.ts',
    './packages/react-core/src/index.ts',
    './packages/react-native/src/index.ts',
  ],
  out: './_typedocs',
  theme: 'default',
  skipErrorChecking: true,
  // ... additional Clerk-style options
}
```

### Package Documentation Coverage
- **@knocklabs/client** - Core client library and interfaces
- **@knocklabs/expo** - Expo-specific push notification components  
- **@knocklabs/react** - React UI components and providers
- **@knocklabs/react-core** - Core React hooks and utilities (including enhanced `useGuide` and `useGuides`)
- **@knocklabs/react-native** - React Native components and providers

## 🎨 Enhanced Documentation Examples

The setup includes enhanced TypeDoc comments for key hooks:

### `useGuide` Hook
```typescript
/**
 * Hook for retrieving and managing a specific guide based on filters.
 * 
 * @example
 * ```typescript
 * const { guide, step, client } = useGuide({ key: 'onboarding-guide' });
 * ```
 */
export const useGuide = <C = Any>(filters: KnockGuideFilterParams): UseGuideReturn<C>
```

### `useGuides` Hook  
```typescript
/**
 * Hook for retrieving and managing multiple guides based on type filters.
 * 
 * @example
 * ```typescript
 * const { guides } = useGuides({ type: 'tutorial' });
 * ```
 */
export const useGuides = <C = Any>(filters: Pick<KnockGuideFilterParams, "type">): UseGuidesReturn<C>
```

## 🔗 Integration Examples

### Docusaurus Integration
1. Copy files from `_typedocs-markdown/` to your `docs/` directory
2. The frontmatter is already configured for Docusaurus compatibility
3. Update your `docusaurus.config.js` to include the new docs

### Next.js Integration
1. Copy MDX files to your `pages/docs/` or `app/docs/` directory
2. Configure your MDX plugin to handle the frontmatter
3. The hierarchical structure maps well to Next.js routing

### Manual Integration
1. Use the HTML output for standalone documentation hosting
2. Open `_typedocs/index.html` in any web browser
3. No additional setup required

## 🚨 Important Notes

- **Skip Error Checking**: Configuration includes `skipErrorChecking: true` to handle unbuilt package dependencies
- **Source Links**: All documentation includes direct links to GitHub source code
- **Automatic Updates**: Re-run documentation generation after code changes
- **Monorepo Friendly**: Designed specifically for workspace/monorepo architectures

## 🔄 Maintenance

The documentation will need to be regenerated when:
- New packages are added to the monorepo
- Public APIs change
- New TypeDoc comments are added
- Package exports are modified

Simply run `./generate-docs.sh` or `yarn docs:build` to regenerate both HTML and MDX documentation.

---

This setup provides a robust, enterprise-grade documentation solution that scales with your monorepo and integrates seamlessly with modern documentation platforms, following the same patterns used by the Clerk JavaScript repository.