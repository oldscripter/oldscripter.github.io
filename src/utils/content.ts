// src/utils/content.ts
import { getCollection } from 'astro:content';

export type Language = 'en' | 'ru';

export async function getLocalizedContent(
  collectionName: 'posts' | 'cpp-lessons' | 'projects',
  lang: Language = 'en'
) {
  const allItems = await getCollection(collectionName);
  return allItems.filter(item => {
    const itemLang = item.id.split('/')[0];
    return itemLang === lang;
  });
}

// ✅ Исправленная функция для поиска связанного контента
export async function getRelatedContent(
  collectionName: 'posts' | 'cpp-lessons' | 'projects',
  currentItem: any,
  targetLang: Language
) {
  const allItems = await getCollection(collectionName);
  
  // Извлекаем slug из ID текущего поста (убираем en/ или ru/)
  const currentSlug = currentItem.id.replace(/^(en|ru)\//, '').replace(/\.md$/, '');
  
  // Ищем пост с таким же slug, но на другом языке
  return allItems.find(item => {
    const itemSlug = item.id.replace(/^(en|ru)\//, '').replace(/\.md$/, '');
    const itemLang = item.id.split('/')[0];
    return itemSlug === currentSlug && itemLang === targetLang;
  });
}

export function sortByDate(items: any[]) {
  return items.sort((a, b) => {
    const dateA = a.data.pubDate || new Date(0);
    const dateB = b.data.pubDate || new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
}