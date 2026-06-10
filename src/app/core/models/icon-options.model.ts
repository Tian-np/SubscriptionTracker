import { DEFAULT_CATEGORIES } from './category.model';

export interface IconOption {
  value: string;
  label: string;
}

/** PrimeIcons ที่ใช้บ่อยสำหรับ subscription */
export const SUBSCRIPTION_ICON_OPTIONS: IconOption[] = [
  { value: 'pi pi-video', label: 'Video' },
  { value: 'pi pi-play', label: 'Play' },
  { value: 'pi pi-youtube', label: 'YouTube' },
  { value: 'pi pi-spotify', label: 'Spotify' },
  { value: 'pi pi-cloud', label: 'Cloud' },
  { value: 'pi pi-database', label: 'Database' },
  { value: 'pi pi-server', label: 'Server' },
  { value: 'pi pi-sparkles', label: 'AI' },
  { value: 'pi pi-bolt', label: 'Bolt' },
  { value: 'pi pi-microchip', label: 'Tech' },
  { value: 'pi pi-apple', label: 'Apple' },
  { value: 'pi pi-shopping-cart', label: 'Cart' },
  { value: 'pi pi-shopping-bag', label: 'Bag' },
  { value: 'pi pi-heart', label: 'Health' },
  { value: 'pi pi-ticket', label: 'Ticket' },
  { value: 'pi pi-credit-card', label: 'Card' },
  { value: 'pi pi-wallet', label: 'Wallet' },
  { value: 'pi pi-paypal', label: 'PayPal' },
  { value: 'pi pi-dollar', label: 'Dollar' },
  { value: 'pi pi-mobile', label: 'Mobile' },
  { value: 'pi pi-wifi', label: 'WiFi' },
  { value: 'pi pi-headphones', label: 'Music' },
  { value: 'pi pi-camera', label: 'Camera' },
  { value: 'pi pi-book', label: 'Book' },
  { value: 'pi pi-graduation-cap', label: 'Learn' },
  { value: 'pi pi-shop', label: 'Shop' },
  { value: 'pi pi-globe', label: 'Web' },
  { value: 'pi pi-envelope', label: 'Mail' },
  { value: 'pi pi-calendar', label: 'Calendar' },
  { value: 'pi pi-gift', label: 'Gift' },
  { value: 'pi pi-star', label: 'Star' },
  { value: 'pi pi-crown', label: 'Premium' },
  { value: 'pi pi-shield', label: 'Security' },
  { value: 'pi pi-briefcase', label: 'Work' },
  { value: 'pi pi-home', label: 'Home' },
  { value: 'pi pi-car', label: 'Transport' },
  { value: 'pi pi-ellipsis-h', label: 'Other' },
];

const CATEGORY_EXTRA_ICONS: Record<string, string[]> = {
  streaming: ['pi pi-play', 'pi pi-youtube', 'pi pi-spotify', 'pi pi-headphones', 'pi pi-ticket'],
  cloud: ['pi pi-database', 'pi pi-folder', 'pi pi-lock', 'pi pi-shield'],
  ai: ['pi pi-bolt', 'pi pi-microchip', 'pi pi-code', 'pi pi-desktop'],
  food: ['pi pi-shopping-cart', 'pi pi-shopping-bag', 'pi pi-gift'],
  hosting: ['pi pi-globe', 'pi pi-code', 'pi pi-database', 'pi pi-wifi'],
  health: ['pi pi-heart', 'pi pi-calendar', 'pi pi-shield'],
  other: ['pi pi-star', 'pi pi-tag', 'pi pi-box'],
};

export function getIconsForCategory(categoryId: string | null): IconOption[] {
  if (!categoryId) return SUBSCRIPTION_ICON_OPTIONS;

  const category = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
  const extras = CATEGORY_EXTRA_ICONS[categoryId] ?? [];
  const values = new Set<string>();

  if (category) values.add(category.icon);
  for (const icon of extras) values.add(icon);
  for (const opt of SUBSCRIPTION_ICON_OPTIONS) values.add(opt.value);

  const byValue = new Map(SUBSCRIPTION_ICON_OPTIONS.map((o) => [o.value, o]));

  return [...values].map((value) => byValue.get(value) ?? { value, label: iconLabel(value) });
}

function iconLabel(iconClass: string): string {
  const name = iconClass.replace('pi pi-', '').replace(/-/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}
