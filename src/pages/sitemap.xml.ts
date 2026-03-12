import { loadConfig, generateSitemap } from '../lib/cms';

export const prerender = true;

export async function GET() {
  const config = loadConfig();
  const baseUrl = 'https://momentaj.com';

  const sitemap = generateSitemap(config, baseUrl, {
    defaultChangefreq: 'weekly',
    defaultPriority: 0.5,
    homePriority: 1.0,
    pagePriority: 0.8,
    collectionPriority: 0.7
  });

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
