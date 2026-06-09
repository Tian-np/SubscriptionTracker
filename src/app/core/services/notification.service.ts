import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

import { SubscriptionStore } from '../stores/subscription.store';
import { formatCurrency } from '../utils/currency.util';
import { PushNotificationService } from './push-notification.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messageService = inject(MessageService);
  private readonly pushService = inject(PushNotificationService);
  private readonly store = inject(SubscriptionStore);

  private readonly shownTags = new Set<string>();

  init(): void {
    this.pushService.init();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkBillingReminders();
      }
    });
  }

  checkBillingReminders(): void {
    const reminders = this.store.billingReminders();
    const base = this.store.baseCurrency();

    for (const item of reminders) {
      const { subscription, daysUntil, amountInBaseCurrency } = item;
      const amount = formatCurrency(amountInBaseCurrency, base);
      const dayLabel = daysUntil === 0 ? 'วันนี้' : `อีก ${daysUntil} วัน`;
      const tag = `billing-${subscription.id}-${subscription.nextBillingDate}`;

      if (this.shownTags.has(tag)) continue;
      this.shownTags.add(tag);

      const title = `แจ้งเตือน: ${subscription.name}`;
      const detail = `ตัดบัตร${dayLabel} — ${amount}`;

      this.messageService.add({
        severity: daysUntil <= 1 ? 'warn' : 'info',
        summary: title,
        detail,
        life: 8000,
        sticky: daysUntil <= 1,
      });

      this.pushService.showLocalNotification(title, detail, tag, daysUntil <= 1);
    }
  }
}
