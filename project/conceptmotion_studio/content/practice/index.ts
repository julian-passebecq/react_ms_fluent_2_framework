import catalog from './catalog.public.json';
import { validateChallenge, type PracticeCatalog } from '@datapass/content';
for (const item of catalog.items) {
  const validation = validateChallenge(item);
  if (!validation.valid) throw new Error(`Invalid checked-in practice item ${item.id}: ${validation.issues.map(issue => issue.message).join(', ')}`);
}
export const practiceCatalog = catalog as unknown as PracticeCatalog;
export const practiceItems = practiceCatalog.items;
export const practiceItemById = (id: string) => practiceItems.find(item => item.id === id);
