import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * TypeDoc configuration for @knocklabs/javascript
 * Based on the Clerk JavaScript repository configuration pattern
 */
export default {
  // Entry points - target specific packages with TypeScript source
  entryPoints: [
    './packages/client/src/index.ts',
    './packages/expo/src/index.ts',
    './packages/react/src/index.ts',
    './packages/react-core/src/index.ts',
    './packages/react-native/src/index.ts',
  ],
  
  // Output configuration
  out: './_typedocs',
  theme: 'default',
  
  // Include README and set name
  readme: './README.md',
  name: '@knocklabs/javascript',
  includeVersion: true,
  
  // Exclude configuration
  excludeExternals: true,
  excludePrivate: true,
  excludeProtected: true,
  excludeInternal: true,
  
  // Source linking
  gitRevision: 'main',
  sourceLinkTemplate: 'https://github.com/knocklabs/javascript/blob/{gitRevision}/{path}#L{line}',
  
  // Documentation generation options
  cleanOutputDir: true,
  
  // TypeScript compiler options
  tsconfig: './tsconfig.json',
  compilerOptions: {
    skipLibCheck: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
  },
  
  // Organization
  categorizeByGroup: true,
  defaultCategory: 'Other',
  categoryOrder: [
    'Hooks',
    'Components',
    'Providers',
    'Types',
    'Interfaces',
    'Utilities',
    'Other'
  ],
  
  // Sorting
  sort: ['source-order'],
  kindSortOrder: [
    'Document',
    'Project', 
    'Module',
    'Namespace',
    'Enum',
    'EnumMember',
    'Class',
    'Interface',
    'TypeAlias',
    'Constructor',
    'Property',
    'Variable',
    'Function',
    'Accessor',
    'Method',
    'Parameter',
    'TypeParameter',
    'TypeLiteral',
    'CallSignature',
    'ConstructorSignature',
    'IndexSignature',
    'GetSignature',
    'SetSignature'
  ],
  
  // Search and indexing
  searchInComments: true,
  
  // Validation
  treatWarningsAsErrors: false,
  
  // Plugin configuration
  plugin: ['typedoc-plugin-markdown'],
  
  // Syntax highlighting for code blocks
  highlightLanguages: ['typescript', 'javascript', 'jsx', 'tsx', 'json', 'bash'],
  
  // Custom CSS and assets
  customCss: undefined,
  
  // Logging
  logLevel: 'Info',
  
  // Better output formatting
  pretty: true,
  
  // Watch mode support
  watch: false,
  
  // Disable git checks for faster builds
  disableGit: false,
  
  // Ensure clean builds - skip error checking due to unbuilt dependencies
  skipErrorChecking: true,
};