import config from './typedoc.config.mjs';

/**
 * TypeDoc configuration for Markdown/MDX output
 * Extends the main config but outputs MDX files instead of HTML
 */
export default {
  ...config,
  
  // Override output directory for markdown
  out: './_typedocs-markdown',
  
  // Use markdown theme
  theme: 'markdown',
  
  // Plugin configuration for markdown
  plugin: ['typedoc-plugin-markdown', 'typedoc-plugin-frontmatter'],
  
  // Markdown-specific options
  fileExtension: '.mdx',
  entryFileName: 'index.mdx',
  
  // Frontmatter configuration
  frontmatterGlobals: {
    layout: 'docs',
    sidebar_position: 1
  },
  
  // Markdown formatting
  membersWithOwnFile: ['Class', 'Interface', 'TypeAlias'],
  flattenOutputFiles: false,
  hideBreadcrumbs: false,
};