// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    tags: z.array(z.string()).default(['gamedev']),
    image: z.object({
      url: z.string(),
      alt: z.string()
    }).optional(),
  })
});

export const collections = {
  posts: postsCollection,
};