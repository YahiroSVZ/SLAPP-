
import { Category } from './types';

export const CATEGORIES: Category[] = [
  Category.FUN,
  Category.FAMILY,
  Category.FASHION,
  Category.SPORTS,
  Category.CULTURE,
  Category.WELLNESS,
  Category.NETWORKING,
  Category.XPERIENCE,
];

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FUN]: 'bg-purple-500 text-purple-100',
  [Category.FAMILY]: 'bg-green-500 text-green-100',
  [Category.FASHION]: 'bg-pink-500 text-pink-100',
  [Category.SPORTS]: 'bg-blue-500 text-blue-100',
  [Category.CULTURE]: 'bg-yellow-500 text-yellow-100',
  [Category.WELLNESS]: 'bg-teal-500 text-teal-100',
  [Category.NETWORKING]: 'bg-indigo-500 text-indigo-100',
  [Category.XPERIENCE]: 'bg-red-500 text-red-100',
  [Category.UNCATEGORIZED]: 'bg-gray-500 text-gray-100',
};
