# Custom CMS Documentation

A minimal, file-based CMS for static sites. Perfect for content-driven websites with collections, pages, and SEO support.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration](#configuration)
3. [Content Collections](#content-collections)
4. [Singleton Collections](#singleton-collections)
5. [Pages](#pages)
6. [SEO](#seo)
7. [Field Types](#field-types)
8. [API Reference](#api-reference)
9. [Implementation Guide](#implementation-guide)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install js-yaml
```

### 2. Create Configuration

Create `src/content/config.yaml`:

```yaml
name: My Site
content_format: json
media:
  folder: media
  allowed_types:
    - image/*
    - application/pdf
```

### 3. Import and Use

```typescript
import { loadConfig, getCollectionItems, getSingletonItem, getPageContent } from './lib/cms';

// Load configuration
const config = loadConfig();

// Get collection items
const posts = getCollectionItems({ folder: 'blog' });

// Get singleton settings
const settings = getSingletonItem({ folder: '_settings', filename: 'settings.json' });
```

---

## Configuration

### Root Configuration

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Site name |
| `content_format` | string | No | Content format (default: `json`) |
| `media` | object | No | Media configuration |
| `collections` | array | No | Content collections |
| `singleton_collections` | array | No | Singleton collections |
| `pages` | array | No | Page configurations |

### Media Configuration

```yaml
media:
  folder: media           # Media folder path
  allowed_types:          # Allowed file types
    - image/*
    - application/pdf
```

---

## Content Collections

Content collections are for content that has multiple items (blog posts, case studies, services, etc.).

### Configuration

```yaml
collections:
  - name: blog
    label: Blog Posts
    slug: blog
    folder: blog
    fields:
      - name: title
        type: text
        label: Title
        required: true
      - name: slug
        type: text
        label: URL Slug
        required: true
      - name: content
        type: markdown
        label: Content
        rows: 15
```

### File Structure

```
src/content/
├── config.yaml
└── blog/
    ├── post-1.json
    ├── post-2.json
    └── post-3.json
```

### Example JSON File

```json
{
  "title": "My Blog Post",
  "slug": "my-blog-post",
  "excerpt": "A short description",
  "content": "## Introduction\n\nFull markdown content...",
  "cover_image": "/media/blog/cover.jpg",
  "author": "John Doe",
  "published_date": "2024-01-15",
  "tags": "tech, development",
  "featured": true,
  "order": 1
}
```

---

## Singleton Collections

Singleton collections are for content that has only ONE item. Examples: settings, SEO config, navigation, footer.

### Configuration

```yaml
singleton_collections:
  - name: settings
    label: Site Settings
    slug: settings
    folder: _settings
    singleton: true
    filename: settings.json
    description: Global site configuration
    fields:
      - name: site_name
        type: text
        label: Site Name
        required: true
      - name: logo
        type: image
        label: Logo
        folder: settings
```

### File Structure

```
src/content/
├── config.yaml
└── _settings/
    ├── settings.json
    ├── seo.json
    └── navigation.json
```

### Example Settings JSON

```json
{
  "site_name": "My Website",
  "site_description": "A great website",
  "logo": "/media/logo.svg",
  "email": "hello@example.com",
  "phone": "+1 234 567 890",
  "address": "123 Main St, City, Country",
  "social_links": {
    "linkedin": "https://linkedin.com/company/example",
    "twitter": "https://twitter.com/example"
  }
}
```

---

## Pages

Pages are for individual pages (home, about, contact, etc.). Each page can have its own set of fields, SEO settings, and default values.

### Configuration

```yaml
pages:
  - name: home
    label: Home Page
    slug: home
    folder: pages
    singleton: true
    template: homepage
    description: Homepage content
    # Default SEO (can be overridden in content)
    seo:
      title: Home
      description: Welcome to our website
      og_type: website
    fields:
      - name: hero_title
        type: text
        label: Hero Title
        required: true
        default: Welcome to Our Site
      - name: hero_subtitle
        type: textarea
        label: Hero Subtitle
        rows: 2
        default: We build amazing experiences
      # SEO Tab Fields - Managed by Marketing Team
      - name: seo_title
        type: text
        label: SEO Title
        description: Override page title for search engines
      - name: seo_description
        type: textarea
        label: SEO Description
        description: Meta description for search engines
        rows: 3
      - name: seo_keywords
        type: text
        label: SEO Keywords
      - name: seo_og_image
        type: image
        label: SEO Open Graph Image
      - name: seo_canonical_url
        type: text
        label: Canonical URL
      - name: seo_no_index
        type: boolean
        label: Hide from Search Engines
        default: false
      - name: seo_no_follow
        type: boolean
        label: Do Not Follow Links
        default: false
```

### How SEO Works (For Developers)

The developer doesn't need to handle SEO in code. SEO fields are automatically extracted from page content and merged with defaults.

**Priority order:**
1. **Content SEO fields** (marketing manager input) - Highest priority
2. **Page config seo** (default SEO from config)
3. **Global SEO settings** (from singleton)

**Developer usage:**

```astro
---
import { loadConfig, getPageContent, buildSEO, generateMetaTags } from '../lib/cms';

const config = loadConfig();
const page = getPage(config, 'home');
const content = getPageContent(page);
const globalSeo = getSingletonItem(getSingletonCollection(config, 'seo'));

// Build SEO automatically - no manual handling needed!
const seo = buildSEO(page, content, globalSeo);

// Or generate all meta tags at once
const metaTags = generateMetaTags(seo, Astro.url.href);
---

<html>
<head>
  <fragment set:html={metaTags} />
</head>
</html>
```

### File Structure

```
src/content/
├── config.yaml
└── pages/
    ├── home.json
    ├── about.json
    └── contact.json
```

### Example Page JSON

```json
{
  "hero_title": "Welcome to Our Site",
  "hero_subtitle": "We build amazing digital experiences",
  "hero_cta_text": "Get Started",
  "hero_cta_link": "/contact",
  "hero_image": "/media/pages/hero.jpg",
  "cta_title": "Ready to start?",
  "cta_button_text": "Contact Us",
  "seo": {
    "title": "Home",
    "description": "Welcome to our website",
    "og_image": "/media/og-home.jpg"
  }
}
```

---

## SEO

### SEO Fields in Pages

Each page can have dedicated SEO fields that marketing managers can edit directly. These fields are prefixed with `seo_` in the config.

```yaml
pages:
  - name: home
    fields:
      # Content fields
      - name: hero_title
        type: text
        default: Welcome
        
      # SEO fields (managed by marketing)
      - name: seo_title
        type: text
        label: SEO Title
      - name: seo_description
        type: textarea
        label: SEO Description
        rows: 3
      - name: seo_keywords
        type: text
        label: SEO Keywords
      - name: seo_og_image
        type: image
        label: SEO Open Graph Image
      - name: seo_canonical_url
        type: text
        label: Canonical URL
      - name: seo_no_index
        type: boolean
        label: Hide from Search Engines
        default: false
      - name: seo_no_follow
        type: boolean
        label: Do Not Follow Links
        default: false
```

### SEO Configuration

SEO can be configured at multiple levels:

1. **Global SEO** - via `singleton_collections` with name `seo`
2. **Page-level defaults** - via the `seo` field in page config
3. **Content-level** - via the `seo_` prefixed fields in page content

### SEO Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | string | Page title |
| `description` | string | Meta description |
| `og_type` | string | Open Graph type (website, article) |
| `og_image` | string | Open Graph image URL |
| `canonical` | string | Canonical URL |
| `keywords` | string | Meta keywords (comma-separated) |
| `index` | boolean | Allow indexing (default: true) |
| `follow` | boolean | Allow following links (default: true) |

### Example SEO Configuration

```yaml
# In singleton_collections
- name: seo
  label: SEO Settings
  slug: seo
  folder: _settings
  singleton: true
  filename: seo.json
  fields:
    - name: site_title
      type: text
      label: Default Site Title
    - name: site_keywords
      type: text
      label: Default Keywords
    - name: og_image
      type: image
      label: Default OG Image
    - name: google_analytics_id
      type: text
      label: Google Analytics ID
```

### Robots.txt

Configure in SEO settings:

```json
{
  "robots_txt": "Allow: /\nDisallow: /api/\nSitemap: https://example.com/sitemap.xml"
}
```

---

## Field Types

| Type | Description | Supports Default |
|------|-------------|------------------|
| `text` | Single line text input | Yes |
| `textarea` | Multi-line text area | Yes |
| `markdown` | Markdown editor | Yes |
| `number` | Number input | Yes |
| `boolean` | Toggle switch | Yes |
| `date` | Date picker | Yes |
| `datetime` | Date & time picker | Yes |
| `select` | Dropdown selection | Yes |
| `image` | Image upload | No |
| `file` | File upload | No |
| `json` | JSON editor | Yes |

### Field Properties

```yaml
- name: title
  type: text
  label: Title
  required: true          # Make field required
  placeholder: Enter...   # Placeholder text
  rows: 5                 # For textarea/markdown
  default: "Default"      # Default value
  description: Help text  # Field description
```

### JSON Field Example

```yaml
- name: social_links
  type: json
  label: Social Links
  default: {}
  placeholder: '{"linkedin": "", "twitter": ""}'
```

```json
{
  "social_links": {
    "linkedin": "https://linkedin.com/company/example",
    "twitter": "https://twitter.com/example"
  }
}
```

---

## API Reference

### Configuration Functions

```typescript
// Load and parse configuration
loadConfig(): CMSConfig
parseConfig(yamlString: string): CMSConfig

// Get collections
getCollection(config, name): Collection | undefined
getCollectionBySlug(config, slug): Collection | undefined
getSingletonCollection(config, name): Collection | undefined
getSingletonCollections(config): Collection[]
getPage(config, name): Page | undefined
getPages(config): Page[]
```

### Content Functions

```typescript
// Get collection items
getCollectionItems(collection): Object[]

// Get single item by slug
getCollectionItem(collection, slug): Object | undefined

// Get singleton item
getSingletonItem(collection): Object | undefined

// Get page content
getPageContent(page): Object | undefined

// Save content
saveCollectionItem(collection, slug, data): void
saveSingletonItem(collection, data): void
savePageContent(page, data): void

// Delete content
deleteCollectionItem(collection, slug): boolean
```

### SEO Functions

```typescript
// Extract SEO fields from content (marketing manager input)
extractSEOFromContent(content): Object

// Build SEO metadata (automatic merging)
buildSEO(page, content, globalSeo): SEOData

// Generate robots.txt
generateRobotsTxt(seoConfig): string

// Generate all meta tags at once
generateMetaTags(seo, baseUrl): string

// Generate sitemap.xml from CMS content
generateSitemap(config, baseUrl, options): string

// Generate llms.txt for AI search engines
generateLLMSTxt(config, options): string
```

### Validation Functions

```typescript
// Validate field
validateField(field, value): { valid: boolean, error?: string }

// Validate entire collection
validateCollection(collection, values): { valid: boolean, errors: Object }

// Get default values
getDefaultValues(collection): Object
```

---

## Implementation Guide

### Step 1: Set Up Project

```
my-project/
├── src/
│   ├── content/
│   │   ├── config.yaml
│   │   ├── _settings/
│   │   ├── pages/
│   │   └── blog/
│   └── lib/
│       └── cms.ts
```

### Step 2: Create Configuration File

Create `src/content/config.yaml` with your content types.

### Step 3: Create Content Files

Create JSON files for each content item.

### Step 4: Build Your Pages

In Astro (or your framework):

```astro
---
import { loadConfig, getPageContent, getSingletonItem, buildSEO } from '../lib/cms';

const config = loadConfig();
const page = getPage(config, 'home');
const content = getPageContent(page);
const settings = getSingletonItem(getSingletonCollection(config, 'settings'));
const seoConfig = getSingletonItem(getSingletonCollection(config, 'seo'));

const seo = buildSEO(page, content, seoConfig);
---

<html>
<head>
  <title>{seo.title}</title>
  <meta name="description" content={seo.description}>
  <meta property="og:title" content={seo.title}>
  <meta property="og:description" content={seo.description}>
  <meta property="og:image" content={seo.ogImage}>
  <meta property="og:type" content={seo.ogType}>
  {!seo.index && <meta name="robots" content="noindex">}
</head>
<body>
  <h1>{content.hero_title}</h1>
  <p>{content.hero_subtitle}</p>
</body>
</html>
```

### Step 5: Add TypeScript Types

```typescript
// src/types/cms.ts

export interface Field {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  default?: any;
  options?: string[];
  folder?: string;
  description?: string;
}

export interface Collection {
  name: string;
  label: string;
  slug: string;
  folder: string;
  fields: Field[];
  singleton?: boolean;
  filename?: string;
  description?: string;
  seo?: SEOConfig;
  template?: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  og_type?: string;
  og_image?: string;
  canonical?: string;
  keywords?: string;
  index?: boolean;
  follow?: boolean;
}

export interface CMSConfig {
  name: string;
  content_format: string;
  media: {
    folder: string;
    allowed_types: string[];
  };
  collections: Collection[];
  singleton_collections: Collection[];
  pages: Collection[];
}
```

---

## Best Practices

### 1. Use Descriptive Names

```yaml
# Good
name: case_studies
label: Case Studies

# Avoid
name: cs
label: CS
```

### 2. Set Default Values

```yaml
- name: order
  type: number
  label: Display Order
  default: 0

- name: featured
  type: boolean
  label: Featured
  default: false
```

### 3. Use SEO at Multiple Levels

```yaml
# 1. Global defaults in page config
pages:
  - name: about
    seo:
      title: About Us
      description: Learn more about us

# 2. Override in content
{
  "seo": {
    "title": "About Our Team - Custom Title"
  }
}
```

### 4. Organize with Folders

```
src/content/
├── _settings/       # Singleton data
├── pages/          # Page content
├── blog/           # Blog posts
├── services/       # Services
└── case-studies/   # Case studies
```

### 5. Version Control

All content is stored as JSON files, making it easy to:
- Track changes with git
- Use code review
- Collaborate with team

---

## Complete Example

### Configuration

```yaml
name: My Business Site
content_format: json
media:
  folder: media
  allowed_types:
    - image/*

singleton_collections:
  - name: settings
    label: Site Settings
    slug: settings
    folder: _settings
    singleton: true
    filename: settings.json
    fields:
      - name: site_name
        type: text
        label: Site Name
      - name: logo
        type: image
        label: Logo

  - name: seo
    label: SEO Settings
    slug: seo
    folder: _settings
    singleton: true
    filename: seo.json
    fields:
      - name: site_title
        type: text
        label: Default Title

pages:
  - name: home
    label: Home
    slug: home
    folder: pages
    singleton: true
    fields:
      - name: hero_title
        type: text
        label: Hero Title

collections:
  - name: services
    label: Services
    slug: services
    folder: services
    fields:
      - name: title
        type: text
        label: Title
      - name: slug
        type: text
        label: Slug
```

### Usage

```typescript
import { loadConfig, getCollectionItems, getSingletonItem, getPageContent, buildSEO, generateSitemap, generateLLMSTxt } from './lib/cms';

const config = loadConfig();

// Get global settings
const settings = getSingletonItem(config.singleton_collections.find(c => c.name === 'settings'));

// Get SEO config
const seoConfig = getSingletonItem(config.singleton_collections.find(c => c.name === 'seo'));

// Get homepage content
const homePage = config.pages.find(p => p.name === 'home');
const homeContent = getPageContent(homePage);
const homeSeo = buildSEO(homePage, homeContent, seoConfig);

// Get services
const services = getCollectionItems(config.collections.find(c => c.name === 'services'));

// Generate sitemap.xml
const sitemap = generateSitemap(config, 'https://example.com', {
  defaultChangefreq: 'weekly',
  defaultPriority: 0.5,
  homePriority: 1.0,
  pagePriority: 0.8,
  collectionPriority: 0.7
});

// Generate llms.txt for AI search engines
const llms = generateLLMSTxt(config, {
  siteName: settings?.site_name || 'My Site',
  baseUrl: 'https://example.com'
});
```

### Sitemap Options

```typescript
generateSitemap(config, baseUrl, {
  defaultChangefreq: 'weekly',  // Default: 'weekly'
  defaultPriority: 0.5,         // Default: 0.5
  collectionPriority: 0.7,       // Default: 0.7
  pagePriority: 0.8,            // Default: 0.8
  homePriority: 1.0             // Default: 1.0
});
```

The sitemap automatically includes:
- Static pages (/, /about, /contact, /services, /case-studies)
- All CMS pages from config
- All collection items with their URLs
- Respects `seo_no_index` and `no_index` flags

---

## Troubleshooting

### Common Issues

1. **Config not found**: Ensure `config.yaml` exists in `src/content/`

2. **Invalid YAML**: Use a YAML validator to check syntax

3. **Missing fields**: Check that all required fields are present in JSON

4. **File not loading**: Ensure JSON files are in correct folder and end with `.json`

### Debug Tips

```typescript
// Log config to debug
const config = loadConfig();
console.log(JSON.stringify(config, null, 2));
```

---

## License

MIT
