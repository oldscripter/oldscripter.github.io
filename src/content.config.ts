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

// 🆕 Функция для создания коллекции с поддержкой языковых папок
function createLocalizedCollection(basePath: string, customSchema = {}) {
  return defineCollection({
    loader: glob({ 
      pattern: '**/*.md', 
      base: `./src/content/${basePath}` 
    }),
    schema: z.object({
      ...baseSchema,
      ...customSchema,
    }),
    // 🆕 Добавляем обработку slug и языка из пути
    async load() {
      const entries = await glob({ 
        pattern: '**/*.md', 
        base: `./src/content/${basePath}` 
      });
      
      return entries.map((entry: any) => {
        const pathParts = entry.id.split('/');
        const lang = pathParts[0]; // 'en' или 'ru'
        const slug = pathParts.slice(1).join('/').replace(/\.md$/, '');
        
        return {
          ...entry,
          id: entry.id,
          slug: slug,
          data: {
            ...entry.data,
            lang: lang, // Добавляем язык в данные
          }
        };
      });
    },
  });
}

// Коллекция обычных постов
const postsCollection = createLocalizedCollection('posts');

// Коллекция уроков C++
const cppLessonsCollection = createLocalizedCollection('cpp-lessons', {
  lessonNumber: z.number().optional(),
  subcategory: z.enum(['algorithms', 'standards', 'beginner', 'intermediate', 'advanced']),
  readingTime: z.number().optional(),
});

// Коллекция проектов
const projectsCollection = createLocalizedCollection('projects', {
  projectName: z.string(),
  githubUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  techStack: z.array(z.string()).default([]),
});

export const collections = {
  posts: postsCollection,
  'cpp-lessons': cppLessonsCollection,
  projects: projectsCollection,
};