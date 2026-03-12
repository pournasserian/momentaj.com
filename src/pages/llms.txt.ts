import { loadConfig, getSingletonItem, generateLLMSTxt } from '../lib/cms';

export const prerender = true;

export async function GET() {
  const config = loadConfig();
  const settings = getSingletonItem(config.singleton_collections?.find((c: any) => c.name === 'settings'));
  const baseUrl = 'https://momentaj.com';

  const llms = generateLLMSTxt(config, {
    siteName: settings?.site_name || 'Momentaj',
    baseUrl
  });

  return new Response(llms, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}
