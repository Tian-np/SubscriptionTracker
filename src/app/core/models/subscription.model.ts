export type BillingCycle = 'monthly' | 'yearly' | 'weekly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface SharedMember {
  name: string;
  shareAmount: number;
}

export interface Subscription {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  status: SubscriptionStatus;
  isShared: boolean;
  sharedMembers: SharedMember[];
  notes?: string;
  remindDaysBefore: number;
  icon?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDto {
  name: string;
  categoryId: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  status: SubscriptionStatus;
  isShared: boolean;
  sharedMembers: SharedMember[];
  notes?: string;
  remindDaysBefore: number;
  icon?: string;
  url?: string;
}

export type UpdateSubscriptionDto = Partial<CreateSubscriptionDto>;

export interface MonthlySummary {
  month: string;
  totalInBaseCurrency: number;
  baseCurrency: string;
  byCategory: { categoryId: string; categoryName: string; total: number }[];
  subscriptionCount: number;
}

export interface UpcomingBilling {
  subscription: Subscription;
  daysUntil: number;
  amountInBaseCurrency: number;
}
