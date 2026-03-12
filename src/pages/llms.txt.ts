import { getCollection, getEntry } from 'astro:content';

export const prerender = true;

export async function GET() {
  const settingsEntry = await getEntry('settings', 'settings');
  const settings = settingsEntry?.data;
  
  const services = await getCollection('services');
  const caseStudies = await getCollection('case-studies');
  const pages = await getCollection('pages');

  const siteName = settings?.site_name || 'Momentaj';
  const baseUrl = 'https://momentaj.com';

  let content = `# ${siteName} - LLM.txt\n\n`;
  content += `Base URL: ${baseUrl}\n\n`;
  
  content += `## Services\n\n`;
  services.forEach(service => {
    content += `- [${service.data.title}](${baseUrl}/services/${service.data.slug}): ${service.data.short_description}\n`;
  });

  content += `\n## Case Studies\n\n`;
  caseStudies.forEach(study => {
    content += `- [${study.data.title}](${baseUrl}/case-studies/${study.data.slug}): ${study.data.description}\n`;
  });

  content += `\n## Pages\n\n`;
  pages.forEach(page => {
    const slug = page.id === 'home' ? '' : page.id;
    content += `- [${page.data.page_title}](${baseUrl}/${slug})\n`;
  });

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}
