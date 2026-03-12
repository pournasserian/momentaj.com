import { getCollection, getEntry } from 'astro:content';

export const prerender = true;

export async function GET() {
  const settingsEntry = await getEntry('settings', 'settings');
  const settings = settingsEntry?.data;
  
  const services = await getCollection('services');
  const caseStudies = await getCollection('case-studies');
  const pages = await getCollection('pages');

  const siteName = settings?.site_name || 'Momentaj';
  const siteDescription = settings?.site_description || 'Software development and IT consulting company based in Toronto';
  const baseUrl = 'https://momentaj.com';

  let content = `# ${siteName}\n\n`;
  content += `> ${siteDescription}\n\n`;
  content += `This file provides a machine-readable summary of Momentaj's services, case studies, and company information for LLMs and AI agents.\n\n`;
  
  content += `## Company Information\n\n`;
  content += `- **Name**: ${siteName}\n`;
  content += `- **Location**: ${settings?.address || 'Toronto, Canada'}\n`;
  content += `- **Email**: ${settings?.email || 'info@momentaj.com'}\n`;
  content += `- **Website**: ${baseUrl}\n\n`;

  content += `## Services\n\n`;
  content += `Momentaj provides high-performance digital products and tailored software solutions.\n\n`;
  services.sort((a, b) => a.data.order - b.data.order).forEach(service => {
    content += `### [${service.data.title}](${baseUrl}/services/${service.data.slug})\n`;
    content += `${service.data.short_description}\n\n`;
  });

  content += `## Case Studies\n\n`;
  content += `Real-world examples of our work and the results we've delivered for our clients.\n\n`;
  caseStudies.sort((a, b) => a.data.order - b.data.order).forEach(study => {
    content += `### [${study.data.title}](${baseUrl}/case-studies/${study.data.slug})\n`;
    content += `**Client**: ${study.data.client}\n`;
    content += `${study.data.description}\n`;
    if (study.data.stats?.technologies) {
      content += `**Technologies**: ${study.data.stats.technologies.join(', ')}\n`;
    }
    content += `\n`;
  });

  content += `## Navigation\n\n`;
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
