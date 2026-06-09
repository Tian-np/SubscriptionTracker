import { BillingCycle, SharedMember, SubscriptionStatus } from './subscription.model';

export interface SubscriptionRow {
  id: string;
  user_id: string;
  name: string;
  category_id: string;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_billing_date: string;
  status: SubscriptionStatus;
  is_shared: boolean;
  shared_members: SharedMember[];
  notes: string | null;
  remind_days_before: number;
  icon: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsRow {
  user_id: string;
  base_currency: string;
  updated_at: string;
}
