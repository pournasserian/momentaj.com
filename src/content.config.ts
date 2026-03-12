import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const seoSchema = z.object({
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
  seo_og_image: z.string().optional(),
  seo_canonical_url: z.string().optional(),
  seo_no_index: z.boolean().optional(),
  seo_no_follow: z.boolean().optional(),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    client: z.string(),
    description: z.string(),
    content: z.union([
      z.string(),
      z.object({
        overview: z.string().optional(),
        challenge: z.string().optional(),
        solution: z.string().optional(),
        results: z.string().optional(),
      })
    ]),
    stats: z.object({
      duration: z.string().optional(),
      teamSize: z.string().optional(),
      technologies: z.array(z.string()).optional(),
    }).optional(),
    hero_image: z.string(),
    tags: z.string().transform((val) => val.split(',').map((tag) => tag.trim())),
    featured: z.boolean(),
    order: z.number(),
    url: z.string().url().optional(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    short_description: z.string(),
    content: z.string(),
    icon: z.string(),
    featured: z.boolean(),
    order: z.number(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/pages' }),
  schema: z.object({
    page_title: z.string(),
    hero_image: z.string().optional(),
    content: z.string().optional(),
  }).merge(seoSchema).passthrough(),
});

const settings = defineCollection({
  loader: glob({ pattern: 'settings.json', base: './src/content/_settings' }),
  schema: z.object({
    site_name: z.string(),
    site_title: z.string(),
    site_description: z.string(),
    site_keywords: z.string(),
    logo: z.string(),
    favicon: z.string(),
    og_image: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    social_links: z.object({
      linkedin: z.string().url().optional(),
      twitter: z.string().url().optional(),
      github: z.string().url().optional(),
    }),
    google_analytics_id: z.string().optional(),
    google_tag_manager_id: z.string().optional(),
    robots_txt: z.string(),
    navigation: z.array(
      z.object({
        label: z.string(),
        url: z.string(),
        order: z.number(),
      })
    ),
  }),
});

export const collections = {
  'case-studies': caseStudies,
  'services': services,
  'pages': pages,
  'settings': settings,
};
