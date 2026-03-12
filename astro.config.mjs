// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://momentaj.com',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [mdx(), sitemap({
    serialize(item) {
      if (/services\/|case-studies\//.test(item.url)) {
        // @ts-ignore
        item.changefreq = 'monthly';
        item.priority = 0.8;
      } else {
        // @ts-ignore
        item.changefreq = 'weekly';
        item.priority = 1.0;
      }
      return item;
    },
  })]
});
