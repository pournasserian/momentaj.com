import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

/**
 * @typedef {Object} Field
 * @property {string} name - Field name
 * @property {string} type - Field type (text, textarea, number, boolean, select, date, image, file, json, markdown)
 * @property {string} label - Display label
 * @property {boolean} [required] - Is field required
 * @property {string} [placeholder] - Placeholder text
 * @property {number} [rows] - Number of rows for textarea
 * @property {string} [default] - Default value
 * @property {string[]} [options] - Options for select field
 * @property {string} [folder] - Folder for media uploads
 * @property {string[]} [allowedTypes] - Allowed file types
 * @property {string} [description] - Field description
 */

/**
 * @typedef {Object} SEOConfig
 * @property {string} title - Page title
 * @property {string} description - Meta description
 * @property {string} [og_type] - Open Graph type (website, article, etc.)
 * @property {string} [canonical] - Canonical URL
 * @property {string[]} [keywords] - Meta keywords
 * @property {boolean} [index] - Whether to index (default: true)
 * @property {boolean} [follow] - Whether to follow (default: true)
 */

/**
 * @typedef {Object} Collection
 * @property {string} name - Collection name (unique identifier)
 * @property {string} label - Display label
 * @property {string} slug - URL slug
 * @property {string} folder - Folder path in repo
 * @property {Field[]} fields - Collection fields
 * @property {boolean} [singleton] - If true, collection has only one item
 * @property {string} [description] - Collection description
 * @property {SEOConfig} [seo] - Default SEO settings for collection
 * @property {string} [template] - Template to use for this content
 */

/**
 * @typedef {Object} Page
 * @property {string} name - Page name (unique identifier)
 * @property {string} label - Display label
 * @property {string} slug - URL slug
 * @property {string} folder - Folder path in repo
 * @property {Field[]} fields - Page fields
 * @property {boolean} singleton - If true, page has only one item
 * @property {string} [description] - Page description
 * @property {SEOConfig} [seo] - Default SEO settings for page
 * @property {string} [template] - Template to use for this page
 */

/**
 * @typedef {Object} MediaConfig
 * @property {string} folder - Media folder path
 * @property {string[]} allowedTypes - Allowed file types
 */

/**
 * @typedef {Object} CMSConfig
 * @property {string} name - Site name
 * @property {string} content_format - Content format (json)
 * @property {MediaConfig} media - Media configuration
 * @property {Collection[]} collections - Content collections (multiple items)
 * @property {Collection[]} singleton_collections - Singleton collections (single items like settings)
 * @property {Page[]} pages - Page configurations
 */

// Content directory path
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');
const CONFIG_FILE = path.join(CONTENT_DIR, 'config.yaml');

/**
 * Load CMS configuration from YAML file
 * @returns {CMSConfig} Parsed configuration
 */
export function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      throw new Error('CMS config file not found. Please create src/content/config.yaml');
    }
    const yamlString = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return parseConfig(yamlString);
  } catch (error) {
    throw new Error(`Failed to load config: ${error.message}`);
  }
}

/**
 * Parse YAML config string into CMSConfig object
 * @param {string} yamlString - Raw YAML string
 * @returns {CMSConfig} Parsed configuration
 * @throws {Error} If YAML is invalid
 */
export function parseConfig(yamlString) {
  try {
    const config = yaml.load(yamlString);
    return validateConfig(config);
  } catch (error) {
    throw new Error(`Failed to parse config: ${error.message}`);
  }
}

/**
 * Validate config structure
 * @param {Object} config - Raw config object
 * @returns {CMSConfig} Validated config
 * @throws {Error} If config is invalid
 */
function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be an object');
  }

  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Config must have a name');
  }

  // Validate collections (if present)
  if (config.collections) {
    if (!Array.isArray(config.collections)) {
      throw new Error('collections must be an array');
    }
    config.collections.forEach((collection, index) => {
      validateCollectionBase(collection, index, 'collection');
    });
  }

  // Validate singleton_collections
  if (config.singleton_collections) {
    if (!Array.isArray(config.singleton_collections)) {
      throw new Error('singleton_collections must be an array');
    }
    config.singleton_collections.forEach((collection, index) => {
      validateCollectionBase(collection, index, 'singleton_collection');
    });
  }

  // Validate pages
  if (config.pages) {
    if (!Array.isArray(config.pages)) {
      throw new Error('pages must be an array');
    }
    config.pages.forEach((page, index) => {
      validateCollectionBase(page, index, 'page');
    });
  }

  return {
    name: config.name,
    content_format: config.content_format || 'json',
    media: config.media || { folder: 'media', allowed_types: ['image/*'] },
    collections: config.collections || [],
    singleton_collections: config.singleton_collections || [],
    pages: config.pages || []
  };
}

/**
 * Validate a collection or page base structure
 * @param {Object} item - Collection or page object
 * @param {number} index - Index in parent array
 * @param {string} type - Type name for error messages
 */
function validateCollectionBase(item, index, type) {
  if (!item.name) {
    throw new Error(`${type} at index ${index} must have a name`);
  }
  if (!item.label) {
    throw new Error(`${type} "${item.name}" must have a label`);
  }
  if (!item.slug) {
    throw new Error(`${type} "${item.name}" must have a slug`);
  }
  if (!item.folder) {
    throw new Error(`${type} "${item.name}" must have a folder`);
  }
  if (!item.fields || !Array.isArray(item.fields)) {
    throw new Error(`${type} "${item.name}" must have fields array`);
  }

  // Validate fields
  item.fields.forEach((field, fieldIndex) => {
    if (!field.name) {
      throw new Error(`Field at index ${fieldIndex} in ${type} "${item.name}" must have a name`);
    }
    if (!field.type) {
      throw new Error(`Field "${field.name}" in ${type} "${item.name}" must have a type`);
    }
    if (!field.label) {
      throw new Error(`Field "${field.name}" in ${type} "${item.name}" must have a label`);
    }
  });
}

/**
 * Get collection by name
 * @param {CMSConfig} config - CMS configuration
 * @param {string} name - Collection name
 * @returns {Collection|undefined} Collection object
 */
export function getCollection(config, name) {
  return config.collections.find(c => c.name === name);
}

/**
 * Get collection by slug
 * @param {CMSConfig} config - CMS configuration
 * @param {string} slug - Collection slug
 * @returns {Collection|undefined} Collection object
 */
export function getCollectionBySlug(config, slug) {
  return config.collections.find(c => c.slug === slug);
}

/**
 * Get all collections as navigation items
 * @param {CMSConfig} config - CMS configuration
 * @returns {Array<{name: string, label: string, slug: string}>}
 */
export function getNavigationItems(config) {
  return config.collections.map(c => ({
    name: c.name,
    label: c.label,
    slug: c.slug
  }));
}

/**
 * Get field by name from collection
 * @param {Collection} collection - Collection object
 * @param {string} fieldName - Field name
 * @returns {Field|undefined} Field object
 */
export function getField(collection, fieldName) {
  return collection.fields.find(f => f.name === fieldName);
}

/**
 * Generate default values for a collection
 * @param {Collection} collection - Collection object
 * @returns {Object} Default values
 */
export function getDefaultValues(collection) {
  const defaults = {};
  collection.fields.forEach(field => {
    if (field.default !== undefined) {
      defaults[field.name] = field.default;
    } else {
      switch (field.type) {
        case 'boolean':
          defaults[field.name] = false;
          break;
        case 'number':
          defaults[field.name] = 0;
          break;
        case 'text':
        case 'textarea':
        case 'select':
        case 'date':
        case 'datetime':
        case 'image':
        case 'file':
        case 'markdown':
        default:
          defaults[field.name] = '';
      }
    }
  });
  return defaults;
}

/**
 * Validate field value against field definition
 * @param {Field} field - Field definition
 * @param {any} value - Value to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateField(field, value) {
  if (field.required) {
    if (value === undefined || value === null || value === '') {
      return { valid: false, error: `${field.label} is required` };
    }
  }
  return { valid: true };
}

/**
 * Validate all fields in a collection
 * @param {Collection} collection - Collection object
 * @param {Object} values - Values to validate
 * @returns {Object} { valid: boolean, errors: Object }
 */
export function validateCollection(collection, values) {
  const errors = {};
  let valid = true;

  collection.fields.forEach(field => {
    const result = validateField(field, values[field.name]);
    if (!result.valid) {
      errors[field.name] = result.error;
      valid = false;
    }
  });

  return { valid, errors };
}

/**
 * Get all items in a collection
 * @param {Collection} collection - Collection object
 * @returns {Array<Object>} Array of collection items
 */
export function getCollectionItems(collection) {
  const collectionPath = path.join(CONTENT_DIR, collection.folder);
  
  if (!fs.existsSync(collectionPath)) {
    return [];
  }

  const files = fs.readdirSync(collectionPath).filter(file => file.endsWith('.json'));
  
  return files.map(file => {
    const filePath = path.join(collectionPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  });
}

/**
 * Get a single item from a collection by slug
 * @param {Collection} collection - Collection object
 * @param {string} slug - Item slug
 * @returns {Object|undefined} Item object
 */
export function getCollectionItem(collection, slug) {
  const itemPath = path.join(CONTENT_DIR, collection.folder, `${slug}.json`);
  
  if (!fs.existsSync(itemPath)) {
    return undefined;
  }

  const content = fs.readFileSync(itemPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save an item to a collection
 * @param {Collection} collection - Collection object
 * @param {string} slug - Item slug
 * @param {Object} data - Item data
 */
export function saveCollectionItem(collection, slug, data) {
  const collectionPath = path.join(CONTENT_DIR, collection.folder);
  
  if (!fs.existsSync(collectionPath)) {
    fs.mkdirSync(collectionPath, { recursive: true });
  }

  const itemPath = path.join(collectionPath, `${slug}.json`);
  fs.writeFileSync(itemPath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Delete an item from a collection
 * @param {Collection} collection - Collection object
 * @param {string} slug - Item slug
 * @returns {boolean} Whether deletion was successful
 */
export function deleteCollectionItem(collection, slug) {
  const itemPath = path.join(CONTENT_DIR, collection.folder, `${slug}.json`);
  
  if (!fs.existsSync(itemPath)) {
    return false;
  }

  fs.unlinkSync(itemPath);
  return true;
}

/**
 * Get content directory path
 * @returns {string} Content directory path
 */
export function getContentDir() {
  return CONTENT_DIR;
}

/**
 * Ensure content directory exists
 */
export function ensureContentDir() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
}

// ===========================================
// SINGLETON COLLECTIONS
// ===========================================

/**
 * Get singleton collection by name
 * @param {CMSConfig} config - CMS configuration
 * @param {string} name - Singleton collection name
 * @returns {Object|undefined} Singleton collection
 */
export function getSingletonCollection(config, name) {
  return config.singleton_collections?.find(c => c.name === name);
}

/**
 * Get all singleton collections
 * @param {CMSConfig} config - CMS configuration
 * @returns {Array} Array of singleton collections
 */
export function getSingletonCollections(config) {
  return config.singleton_collections || [];
}

/**
 * Get singleton item (only one item per collection)
 * @param {Object} collection - Singleton collection
 * @returns {Object|undefined} Singleton item data
 */
export function getSingletonItem(collection) {
  if (!collection) return undefined;
  
  const collectionPath = path.join(CONTENT_DIR, collection.folder);
  
  if (!fs.existsSync(collectionPath)) {
    return undefined;
  }

  // Use filename if specified, otherwise try to find any JSON file
  const filename = collection.filename || 'default.json';
  const itemPath = path.join(collectionPath, filename);
  
  if (!fs.existsSync(itemPath)) {
    return undefined;
  }

  const content = fs.readFileSync(itemPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save singleton item (uses fixed filename)
 * @param {Object} collection - Singleton collection
 * @param {Object} data - Item data
 */
export function saveSingletonItem(collection, data) {
  const collectionPath = path.join(CONTENT_DIR, collection.folder);
  
  if (!fs.existsSync(collectionPath)) {
    fs.mkdirSync(collectionPath, { recursive: true });
  }

  // Use filename if specified, otherwise use default.json
  const filename = collection.filename || 'default.json';
  const itemPath = path.join(collectionPath, filename);
  fs.writeFileSync(itemPath, JSON.stringify(data, null, 2), 'utf-8');
}

// ===========================================
// PAGES
// ===========================================

/**
 * Get page configuration by name
 * @param {CMSConfig} config - CMS configuration
 * @param {string} name - Page name
 * @returns {Object|undefined} Page configuration
 */
export function getPage(config, name) {
  return config.pages?.find(p => p.name === name);
}

/**
 * Get all pages
 * @param {CMSConfig} config - CMS configuration
 * @returns {Array} Array of page configurations
 */
export function getPages(config) {
  return config.pages || [];
}

/**
 * Get page content by name
 * @param {Object} page - Page configuration
 * @returns {Object|undefined} Page content data
 */
export function getPageContent(page) {
  if (!page) return undefined;
  
  const pagePath = path.join(CONTENT_DIR, page.folder, `${page.slug}.json`);
  
  if (!fs.existsSync(pagePath)) {
    return undefined;
  }

  const content = fs.readFileSync(pagePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save page content
 * @param {Object} page - Page configuration
 * @param {Object} data - Page data including SEO
 */
export function savePageContent(page, data) {
  const pagePath = path.join(CONTENT_DIR, page.folder);
  
  if (!fs.existsSync(pagePath)) {
    fs.mkdirSync(pagePath, { recursive: true });
  }

  const itemPath = path.join(pagePath, `${page.slug}.json`);
  fs.writeFileSync(itemPath, JSON.stringify(data, null, 2), 'utf-8');
}

// ===========================================
// SEO HELPERS
// ===========================================

/**
 * SEO field prefixes
 */
const SEO_FIELD_PREFIX = 'seo_';

/**
 * Extract SEO fields from content data
 * @param {Object} content - Page content
 * @returns {Object} Extracted SEO data
 */
export function extractSEOFromContent(content) {
  if (!content) return {};
  
  const seoData = {};
  
  // Look for seo_ prefixed fields
  Object.keys(content).forEach(key => {
    if (key.startsWith(SEO_FIELD_PREFIX)) {
      const seoKey = key.replace(SEO_FIELD_PREFIX, '');
      
      // Map seo_no_index and seo_no_follow
      if (seoKey === 'no_index') {
        seoData.index = !content[key];
      } else if (seoKey === 'no_follow') {
        seoData.follow = !content[key];
      } else {
        seoData[seoKey] = content[key];
      }
    }
  });
  
  return seoData;
}

/**
 * Build SEO metadata from page config and content
 * Priority: Content SEO fields > Page config seo > Global seo
 * @param {Object} page - Page configuration
 * @param {Object} content - Page content
 * @param {Object} [globalSeo] - Global SEO settings
 * @returns {Object} SEO metadata
 */
export function buildSEO(page, content, globalSeo = {}) {
  // Start with global SEO
  const seo = {
    title: globalSeo.site_title || '',
    description: globalSeo.site_description || '',
    ogImage: globalSeo.og_image,
    ogType: 'website',
    index: true,
    follow: true,
    canonical: '',
    keywords: globalSeo.site_keywords || ''
  };
  
  // Apply page-level default SEO from config
  if (page?.seo) {
    if (page.seo.title) seo.title = page.seo.title;
    if (page.seo.description) seo.description = page.seo.description;
    if (page.seo.og_type) seo.ogType = page.seo.og_type;
    if (page.seo.og_image) seo.ogImage = page.seo.og_image;
    if (page.seo.index !== undefined) seo.index = page.seo.index;
    if (page.seo.follow !== undefined) seo.follow = page.seo.follow;
    if (page.seo.keywords) seo.keywords = page.seo.keywords;
  }
  
  // Apply content-specific SEO from content fields (marketing manager input)
  if (content) {
    const contentSEO = extractSEOFromContent(content);
    
    if (contentSEO.title) seo.title = contentSEO.title;
    if (contentSEO.description) seo.description = contentSEO.description;
    if (contentSEO.og_image) seo.ogImage = contentSEO.og_image;
    if (contentSEO.canonical_url) seo.canonical = contentSEO.canonical_url;
    if (contentSEO.keywords) seo.keywords = contentSEO.keywords;
    if (contentSEO.index !== undefined) seo.index = contentSEO.index;
    if (contentSEO.follow !== undefined) seo.follow = contentSEO.follow;
  }
  
  return seo;
}

/**
 * Generate robots.txt content
 * @param {Object} seoConfig - SEO settings
 * @returns {string} Robots.txt content
 */
export function generateRobotsTxt(seoConfig) {
  const lines = [
    '# Robots.txt generated by CMS',
    'User-agent: *',
    ''
  ];
  
  if (seoConfig?.robots_txt) {
    lines.push(seoConfig.robots_txt);
  } else {
    lines.push('Allow: /');
    lines.push('Disallow: /api/');
    lines.push('Disallow: /_');
  }
  
  return lines.join('\n');
}

/**
 * Get SEO-friendly HTML meta tags
 * @param {Object} seo - SEO data
 * @param {string} baseUrl - Base URL for canonical links
 * @returns {string} HTML meta tags
 */
export function generateMetaTags(seo, baseUrl = '') {
  const tags = [];
  
  // Title
  if (seo.title) {
    tags.push(`<title>${seo.title}</title>`);
  }
  
  // Description
  if (seo.description) {
    tags.push(`<meta name="description" content="${seo.description}">`);
  }
  
  // Keywords
  if (seo.keywords) {
    tags.push(`<meta name="keywords" content="${seo.keywords}">`);
  }
  
  // Robots
  const robots = [];
  if (!seo.index) robots.push('noindex');
  if (!seo.follow) robots.push('nofollow');
  if (robots.length > 0) {
    tags.push(`<meta name="robots" content="${robots.join(', ')}">`);
  }
  
  // Canonical
  if (seo.canonical) {
    tags.push(`<link rel="canonical" href="${seo.canonical}">`);
  } else if (baseUrl) {
    tags.push(`<link rel="canonical" href="${baseUrl}">`);
  }
  
  // Open Graph
  tags.push(`<meta property="og:type" content="${seo.ogType || 'website'}">`);
  if (seo.title) {
    tags.push(`<meta property="og:title" content="${seo.title}">`);
  }
  if (seo.description) {
    tags.push(`<meta property="og:description" content="${seo.description}">`);
  }
  if (seo.ogImage) {
    tags.push(`<meta property="og:image" content="${seo.ogImage}">`);
  }
  
  // Twitter Card
  if (seo.title) {
    tags.push(`<meta name="twitter:title" content="${seo.title}">`);
  }
  if (seo.description) {
    tags.push(`<meta name="twitter:description" content="${seo.description}">`);
  }
  if (seo.ogImage) {
    tags.push(`<meta name="twitter:image" content="${seo.ogImage}">`);
  }
  
  return tags.join('\n  ');
}

// ===========================================
// SITEMAP GENERATION
// ===========================================

/**
 * @typedef {Object} SitemapUrl
 * @property {string} loc - URL
 * @property {string} [lastmod] - Last modified date
 * @property {string} [changefreq] - Change frequency (always, hourly, daily, weekly, monthly, yearly, never)
 * @property {number} [priority] - Priority (0.0 - 1.0)
 */

/**
 * Generate sitemap.xml from CMS content
 * @param {CMSConfig} config - CMS configuration
 * @param {string} baseUrl - Base URL of the site
 * @param {Object} [options] - Sitemap options
 * @returns {string} XML sitemap content
 */
export function generateSitemap(config, baseUrl, options = {}) {
  const urls = [];
  const {
    defaultChangefreq = 'weekly',
    defaultPriority = 0.5,
    collectionPriority = 0.7,
    pagePriority = 0.8,
    homePriority = 1.0
  } = options;

  // Add static pages
  const staticPages = [
    { url: '/', priority: homePriority, changefreq: 'daily' },
    { url: '/about', priority: pagePriority, changefreq: 'monthly' },
    { url: '/contact', priority: pagePriority, changefreq: 'monthly' },
    { url: '/services', priority: pagePriority, changefreq: 'weekly' },
    { url: '/case-studies', priority: pagePriority, changefreq: 'weekly' }
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: baseUrl + page.url,
      changefreq: page.changefreq,
      priority: page.priority
    });
  });

  // Add CMS pages
  if (config.pages) {
    config.pages.forEach(page => {
      const content = getPageContent(page);
      const seo = page.seo || {};
      
      // Skip if no_index is set
      if (content?.seo_no_index) return;
      if (seo.index === false) return;

      urls.push({
        loc: baseUrl + '/' + page.slug,
        lastmod: content?.updated_at || undefined,
        changefreq: defaultChangefreq,
        priority: pagePriority
      });
    });
  }

  // Add collection items
  if (config.collections) {
    config.collections.forEach(collection => {
      const items = getCollectionItems(collection);
      
      items.forEach(item => {
        // Skip if no_index is set
        if (item.seo_no_index) return;
        if (item.no_index) return;

        urls.push({
          loc: baseUrl + '/' + collection.slug + '/' + item.slug,
          lastmod: item.updated_at || item.published_date || undefined,
          changefreq: defaultChangefreq,
          priority: collectionPriority
        });
      });
    });
  }

  // Generate XML
  const urlEntries = urls.map(url => {
    let entry = `  <url>
    <loc>${escapeXml(url.loc)}</loc>`;
    
    if (url.lastmod) {
      entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    if (url.changefreq) {
      entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority !== undefined) {
      entry += `\n    <priority>${url.priority}</priority>`;
    }
    
    entry += '\n  </url>';
    return entry;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ===========================================
// LLMS.TXT GENERATION (AI Search)
// ===========================================

/**
 * Generate llms.txt for AI search engines (Perplexity, ChatGPT, etc.)
 * @param {CMSConfig} config - CMS configuration
 * @param {Object} options - Generation options
 * @returns {string} LLMS.txt content
 */
export function generateLLMSTxt(config, options = {}) {
  const { siteName = 'Website', baseUrl = '' } = options;
  const sections = [];

  // Header
  sections.push(`# ${siteName}`);
  sections.push('');
  sections.push('## Pages');
  sections.push('');

  // Add pages content
  if (config.pages) {
    config.pages.forEach(page => {
      const content = getPageContent(page);
      
      // Skip if no_index
      if (content?.seo_no_index) return;

      sections.push(`### ${page.label}`);
      sections.push('');
      sections.push(`URL: ${baseUrl}/${page.slug}`);
      sections.push('');

      // Extract text content
      if (content) {
        // Get page title
        if (content.page_title) {
          sections.push(`Title: ${content.page_title}`);
        }
        if (content.seo_title) {
          sections.push(`SEO Title: ${content.seo_title}`);
        }
        if (content.seo_description) {
          sections.push(`Description: ${content.seo_description}`);
        }

        // Get main content fields
        const textFields = ['content', 'hero_title', 'hero_subtitle', 'cta_title', 'cta_subtitle'];
        textFields.forEach(field => {
          if (content[field]) {
            // Clean markdown
            const text = content[field]
              .replace(/^#+\s+/gm, '')
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .replace(/\[([^(]+)\]\([^)]+\)/g, '$1');
            sections.push('');
            sections.push(text);
          }
        });
      }

      sections.push('');
      sections.push('---');
      sections.push('');
    });
  }

  // Add collections
  if (config.collections) {
    sections.push('## Content');
    sections.push('');

    config.collections.forEach(collection => {
      sections.push(`### ${collection.label}`);
      sections.push('');
      
      const items = getCollectionItems(collection);
      
      items.forEach(item => {
        if (item.seo_no_index || item.no_index) return;
        
        sections.push(`#### ${item.title || item.name || collection.label}`);
        sections.push(`URL: ${baseUrl}/${collection.slug}/${item.slug}`);
        sections.push('');

        // Get text fields
        const textFields = ['title', 'description', 'excerpt', 'short_description', 'content'];
        textFields.forEach(field => {
          if (item[field]) {
            const text = item[field]
              .replace(/^#+\s+/gm, '')
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .replace(/\[([^(]+)\]\([^)]+\)/g, '$1')
              .substring(0, 500); // Limit length
            sections.push(text);
            sections.push('');
          }
        });

        sections.push('---');
        sections.push('');
      });
    });
  }

  // Footer
  sections.push('---');
  sections.push(`Generated from: ${baseUrl}`);
  sections.push(`Generated at: ${new Date().toISOString()}`);

  return sections.join('\n');
}

// ===========================================
// COLLECTION TYPES
// ===========================================

/**
 * Get all content types (collections, singletons, pages)
 * @param {CMSConfig} config - CMS configuration
 * @returns {Array} Array of all content types
 */
export function getAllContentTypes(config) {
  const types = [];
  
  // Regular collections
  config.collections?.forEach(c => {
    types.push({
      type: 'collection',
      name: c.name,
      label: c.label,
      slug: c.slug,
      multiple: true
    });
  });
  
  // Singleton collections
  config.singleton_collections?.forEach(c => {
    types.push({
      type: 'singleton',
      name: c.name,
      label: c.label,
      slug: c.slug,
      multiple: false
    });
  });
  
  // Pages
  config.pages?.forEach(p => {
    types.push({
      type: 'page',
      name: p.name,
      label: p.label,
      slug: p.slug,
      multiple: p.singleton === false
    });
  });
  
  return types;
}
