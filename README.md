# Momentaj Website

Astro-based corporate website for Momentaj, a software development and IT consulting company based in Toronto.

## Quick Start

```bash
npm install
npm run dev
```

## Content Management

All content is stored as JSON files in `src/content/`.

### Settings

Edit `src/content/_settings/settings.json` to update:
- Site name, description, logo
- Contact info (email, phone, address)
- Navigation menu
- Social links

### Services

Add/edit services in `src/content/services/`:
- Each file represents one service
- Required fields: `title`, `slug`, `description`, `content`
- Optional: `icon`, `order`, `disabled`, SEO fields

### Case Studies

Add/edit case studies in `src/content/case-studies/`:
- Each file represents one project
- Required: `title`, `slug`, `client`, `description`, `content`
- Content structure: `overview`, `challenge`, `solution`, `results`
- Screenshots go in `public/images/` and reference as `/images/filename.webp`
- Optional: `stats`, `tags`, `hero_image`, `screenshot`, `url`, `order`, `featured`, `disabled`

### Pages

Edit page content in `src/content/pages/`:
- `home.json` - Homepage content
- `about.json` - About page content  
- `contact.json` - Contact page content

## Adding New Content

### New Service
1. Create `src/content/services/new-service.json`
2. Add required fields (title, slug, description, content)
3. Set `order` to control display position

### New Case Study
1. Create `src/content/case-studies/new-study.json`
2. Add required fields and structured content
3. Add screenshot to `public/images/` 
4. Reference screenshot as `/images/new-study-screenshot.webp`

### New Page
1. Create the route in `src/pages/`
2. Add content file in `src/content/pages/`

## Building

```bash
npm run build
```

Output is in `dist/` - ready for deployment to any static host.

## Deployment

The site builds to static HTML/CSS/JS. Deploy `dist/` to:
- Netlify
- Vercel
- Cloudflare Pages
- AWS S3 + CloudFront
- Any static hosting

## Tech Stack

- **Astro** - Static site generator
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety