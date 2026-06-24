// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Общая схема для всех статей
const baseSchema = {
  title: z.string(),
  description: z.string().optional(),
  pubDate: z.date(),
  tags: z.array(z.string()).default([]),
  author: z.string().default("Stanislav Talanov"),
  image: z.object({
    url: z.string(),
    alt: z.string()
  }).optional(),
};

// Коллекция обычных постов
const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object(baseSchema),
});

// Коллекция уроков C++
const cppLessonsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cpp-lessons' }),
  schema: z.object({
    ...baseSchema,
    lessonNumber: z.number().optional(),      // номер урока
    subcategory: z.enum(['algorithms', 'standards', 'beginner', 'intermediate', 'advanced']), // подраздел
    readingTime: z.number().optional(),
  }),
});

// Коллекция проектов
const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    ...baseSchema,
    projectName: z.string(),                   // название проекта
    githubUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    techStack: z.array(z.string()).default([]),
  }),
});

export const collections = {
  posts: postsCollection,
  'cpp-lessons': cppLessonsCollection,
  projects: projectsCollection,
};