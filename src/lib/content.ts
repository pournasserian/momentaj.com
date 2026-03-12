/**
 * Content loader for Astro - loads CMS content at build time
 * This works with Astro's static site generation
 */

// Import all JSON files using Astro's glob import
const caseStudiesData = import.meta.glob('/src/content/case-studies/*.json', { eager: true });
const servicesData = import.meta.glob('/src/content/services/*.json', { eager: true });
const teamData = import.meta.glob('/src/content/team/*.json', { eager: true });
const testimonialsData = import.meta.glob('/src/content/testimonials/*.json', { eager: true });
const blogData = import.meta.glob('/src/content/blog/*.json', { eager: true });

export interface CaseStudy {
  title: string;
  slug: string;
  client: string;
  description: string;
  content?: string;
  hero_image?: string;
  tags?: string;
  featured?: boolean;
  order?: number;
}

export interface Service {
  title: string;
  slug: string;
  short_description: string;
  content?: string;
  icon?: string;
  featured?: boolean;
  order?: number;
}

export interface TeamMember {
  name: string;
  slug: string;
  role: string;
  bio?: string;
  photo?: string;
  email?: string;
  linkedin?: string;
  order?: number;
}

export interface Testimonial {
  name: string;
  role: string;
  company?: string;
  quote: string;
  photo?: string;
  featured?: boolean;
}

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  cover_image?: string;
  author?: string;
  published_date?: string;
  tags?: string;
  featured?: boolean;
}

/**
 * Get all case studies, sorted by order
 */
export function getCaseStudies(): CaseStudy[] {
  const studies = Object.values(caseStudiesData) as unknown as CaseStudy[];
  return studies.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Get featured case studies
 */
export function getFeaturedCaseStudies(): CaseStudy[] {
  return getCaseStudies().filter(s => s.featured);
}

/**
 * Get a single case study by slug
 */
export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  const key = `/src/content/case-studies/${slug}.json`;
  return caseStudiesData[key] as unknown as CaseStudy;
}

/**
 * Get all services, sorted by order
 */
export function getServices(): Service[] {
  const services = Object.values(servicesData) as unknown as Service[];
  return services.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Get featured services
 */
export function getFeaturedServices(): Service[] {
  return getServices().filter(s => s.featured);
}

/**
 * Get a single service by slug
 */
export function getServiceBySlug(slug: string): Service | undefined {
  const key = `/src/content/services/${slug}.json`;
  return servicesData[key] as unknown as Service;
}

/**
 * Get all team members, sorted by order
 */
export function getTeamMembers(): TeamMember[] {
  const members = Object.values(teamData) as unknown as TeamMember[];
  return members.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Get a single team member by slug
 */
export function getTeamMemberBySlug(slug: string): TeamMember | undefined {
  const key = `/src/content/team/${slug}.json`;
  return teamData[key] as unknown as TeamMember;
}

/**
 * Get all testimonials
 */
export function getTestimonials(): Testimonial[] {
  return Object.values(testimonialsData) as unknown as Testimonial[];
}

/**
 * Get featured testimonials
 */
export function getFeaturedTestimonials(): Testimonial[] {
  return getTestimonials().filter(t => t.featured);
}

/**
 * Get all blog posts, sorted by date
 */
export function getBlogPosts(): BlogPost[] {
  const posts = Object.values(blogData) as unknown as BlogPost[];
  return posts.sort((a, b) => {
    if (!a.published_date) return 1;
    if (!b.published_date) return -1;
    return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
  });
}

/**
 * Get featured blog posts
 */
export function getFeaturedBlogPosts(): BlogPost[] {
  return getBlogPosts().filter(p => p.featured);
}

/**
 * Get a single blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const key = `/src/content/blog/${slug}.json`;
  return blogData[key] as unknown as BlogPost;
}

/**
 * Get all slugs for a collection (for dynamic routes)
 */
export function getCaseStudySlugs(): string[] {
  return Object.keys(caseStudiesData).map(key => key.split('/').pop()?.replace('.json', '') || '');
}

export function getServiceSlugs(): string[] {
  return Object.keys(servicesData).map(key => key.split('/').pop()?.replace('.json', '') || '');
}

export function getBlogPostSlugs(): string[] {
  return Object.keys(blogData).map(key => key.split('/').pop()?.replace('.json', '') || '');
}

export function getTeamMemberSlugs(): string[] {
  return Object.keys(teamData).map(key => key.split('/').pop()?.replace('.json', '') || '');
}
