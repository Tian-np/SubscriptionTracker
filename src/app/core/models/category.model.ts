export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'streaming', name: 'Streaming', icon: 'pi pi-video', color: '#ef4444' },
  { id: 'cloud', name: 'Cloud Storage', icon: 'pi pi-cloud', color: '#3b82f6' },
  { id: 'ai', name: 'AI Tools', icon: 'pi pi-sparkles', color: '#10b981' },
  { id: 'food', name: 'Food & Drink', icon: 'pi pi-apple', color: '#f59e0b' },
  { id: 'hosting', name: 'Hosting & Domain', icon: 'pi pi-server', color: '#6366f1' },
  { id: 'health', name: 'Health', icon: 'pi pi-heart', color: '#ef4444' },
  { id: 'other', name: 'Other', icon: 'pi pi-ellipsis-h', color: '#64748b' },
];
