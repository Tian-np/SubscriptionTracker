import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';

import { Subscription } from '../../core/models/subscription.model';
import { SubbyService } from '../../core/services/subby.service';
import { SubscriptionStore } from '../../core/stores/subscription.store';
import { daysUntil } from '../../core/utils/currency.util';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { PixelBuddyComponent } from '../../shared/components/pixel-buddy/pixel-buddy.component';
import { PixelLoaderComponent } from '../../shared/components/pixel-loader/pixel-loader.component';
import { SubscriptionFormComponent } from './subscription-form.component';

@Component({
  selector: 'app-subscription-list',
  imports: [
    FormsModule,
    Button,
    ConfirmDialog,
    Dialog,
    IconField,
    InputIcon,
    InputText,
    Select,
    Tag,
    CurrencyFormatPipe,
    PixelBuddyComponent,
    PixelLoaderComponent,
    SubscriptionFormComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <p-confirmDialog />

    <div class="space-y-4 sm:space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-100 sm:text-2xl">Subscriptions</h2>
          <p class="text-xs text-slate-500 sm:text-sm">จัดการรายการ subscription ทั้งหมด</p>
        </div>
        <p-button
          label="เพิ่มใหม่"
          icon="pi pi-plus"
          (onClick)="openAddDialog()"
          styleClass="w-full sm:w-auto"
          class="btn-mobile-full hidden sm:inline-flex"
        />
      </div>

      <!-- Filters -->
      <div class="flex flex-col gap-3 sm:flex-row">
        <p-iconfield class="flex-1">
          <p-inputicon class="pi pi-search icon-muted" />
          <input
            pInputText
            placeholder="ค้นหา..."
            class="w-full"
            [ngModel]="store.searchQuery()"
            (ngModelChange)="store.setSearchQuery($event)"
          />
        </p-iconfield>
        <p-select
          [options]="categoryFilterOptions()"
          [ngModel]="store.selectedCategoryId()"
          (ngModelChange)="store.setCategoryFilter($event)"
          optionLabel="label"
          optionValue="value"
          placeholder="ทุกหมวด"
          class="w-full sm:w-48"
          [showClear]="true"
        />
      </div>

      @if (store.loading() && store.subscriptions().length === 0) {
        <div class="flex items-center justify-center py-20">
          <app-pixel-loader label="กำลังดึงรายการ..." />
        </div>
      } @else if (store.filteredSubscriptions().length === 0) {
        <div
          class="pixel-frame rounded-2xl border border-dashed border-midnight-600 bg-card py-12 text-center"
        >
          <app-pixel-buddy sync [size]="72" class="mb-4" />
          <p class="text-slate-500">เริ่มเพิ่ม subscription แรกของคุณกันเถอะ!</p>
          <p-button
            label="เพิ่มรายการแรก"
            icon="pi pi-plus"
            class="mt-4"
            (onClick)="openAddDialog()"
          />
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          @for (sub of store.filteredSubscriptions(); track sub.id) {
            <div
              class="pixel-card group rounded-xl border bg-card p-4 sm:rounded-2xl sm:p-5 hover:border-midnight-600 hover:bg-midnight-800/40"
              [class.border-midnight-700]="sub.status === 'active'"
              [class.border-rose-900/60]="sub.status === 'cancelled'"
              [class.opacity-60]="sub.status !== 'active'"
            >
              <div class="mb-3 flex items-start justify-between">
                <div class="flex items-center gap-3">
                  @if (store.getCategoryById(sub.categoryId); as cat) {
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white shadow-sm"
                      [style.background-color]="cat.color + 'cc'"
                    >
                      <i [class]="cat.icon + ' text-sm'"></i>
                    </div>
                  }
                  <div>
                    <h3 class="font-semibold text-slate-100">{{ sub.name }}</h3>
                    @if (store.getCategoryById(sub.categoryId); as cat) {
                      <p class="text-xs text-slate-500">{{ cat.name }}</p>
                    }
                  </div>
                </div>
                <p-tag
                  [value]="statusLabel(sub.status)"
                  [severity]="statusSeverity(sub.status)"
                  [rounded]="true"
                />
              </div>

              <div class="mb-3 space-y-1.5 sm:mb-4">
                <p class="text-xl font-bold text-slate-100 sm:text-2xl">
                  {{ sub.amount | currencyFormat: sub.currency }}
                  <span class="text-xs font-normal text-slate-500 sm:text-sm"
                    >/{{ cycleLabel(sub.billingCycle) }}</span
                  >
                </p>
                @if (sub.status === 'active') {
                  <div
                    class="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 sm:text-sm"
                  >
                    <span>ตัดบัตร: {{ formatDate(sub.nextBillingDate) }}</span>
                    <p-tag
                      [value]="daysLabel(daysUntil(sub.nextBillingDate))"
                      [severity]="urgencySeverity(daysUntil(sub.nextBillingDate))"
                      class="text-xs"
                    />
                  </div>
                }
                @if (sub.isShared) {
                  <p-tag
                    value="Shared"
                    icon="pi pi-users"
                    severity="info"
                    [rounded]="true"
                    class="text-xs"
                  />
                }
              </div>

              @if (sub.notes) {
                <p class="mb-3 text-xs text-slate-400 italic">{{ sub.notes }}</p>
              }

              <div
                class="flex gap-2 border-t border-midnight-700 pt-3 sm:border-0 sm:pt-0 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
              >
                <p-button
                  label="แก้ไข"
                  icon="pi pi-pencil"
                  [outlined]="true"
                  size="small"
                  styleClass="flex-1 sm:flex-none"
                  (onClick)="openEditDialog(sub)"
                />
                <p-button
                  label="ลบ"
                  icon="pi pi-trash"
                  severity="danger"
                  [outlined]="true"
                  size="small"
                  styleClass="flex-1 sm:flex-none"
                  (onClick)="confirmDelete(sub)"
                />
              </div>
            </div>
          }
        </div>
      }
    </div>

    <p-dialog
      [header]="editingSubscription() ? 'แก้ไข Subscription' : 'เพิ่ม Subscription'"
      [visible]="dialogVisible()"
      (visibleChange)="onDialogVisibleChange($event)"
      [modal]="true"
      [draggable]="false"
      [style]="{ width: '600px' }"
      [breakpoints]="{ '768px': '600px', '0px': '100vw' }"
      styleClass="mobile-sheet-dialog"
    >
      @if (dialogVisible()) {
        <app-subscription-form
          [formKey]="formKey()"
          [subscription]="editingSubscription()"
          (saved)="onFormSaved()"
          (cancelled)="closeDialog()"
        />
      }
    </p-dialog>
  `,
})
export class SubscriptionListComponent implements OnInit {
  readonly store = inject(SubscriptionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly subby = inject(SubbyService);

  readonly dialogVisible = signal(false);
  readonly editingSubscription = signal<Subscription | null>(null);
  readonly formKey = signal(0);

  constructor() {
    effect(() => {
      if (this.store.loading()) return;

      const total = this.store.subscriptions().length;
      const filtered = this.store.filteredSubscriptions().length;
      const query = this.store.searchQuery().trim();
      const category = this.store.selectedCategoryId();

      if (total === 0) {
        this.subby.react('empty');
        return;
      }

      if (filtered === 0) {
        if (query) {
          this.subby.react('not_found', `หา "${query}" ไม่เจอเลย`);
        } else if (category) {
          this.subby.react('not_found', 'ไม่มีรายการในหมวดนี้');
        }
        return;
      }

      this.subby.refreshContext();
    });
  }

  ngOnInit(): void {
    if (this.store.subscriptions().length === 0) {
      this.store.loadAll();
    }

    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'add') {
        this.openAddDialog();
      }
    });
  }

  categoryFilterOptions() {
    return [
      { label: 'ทุกหมวด', value: null },
      ...this.store.categories().map((c) => ({ label: c.name, value: c.id })),
    ];
  }

  openAddDialog(): void {
    this.store.error.set(null);
    this.editingSubscription.set(null);
    this.formKey.update((k) => k + 1);
    this.dialogVisible.set(true);
  }

  openEditDialog(sub: Subscription): void {
    this.store.error.set(null);
    this.editingSubscription.set(sub);
    this.formKey.update((k) => k + 1);
    this.dialogVisible.set(true);
  }

  onFormSaved(): void {
    this.closeDialog();
  }

  onDialogVisibleChange(visible: boolean): void {
    if (!visible) {
      this.closeDialog();
    }
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.editingSubscription.set(null);
  }

  confirmDelete(sub: Subscription): void {
    this.confirmationService.confirm({
      message: `ต้องการลบ "${sub.name}" ใช่หรือไม่?`,
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'ลบ',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.store.delete(sub.id),
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });
  }

  daysUntil = daysUntil;

  daysLabel(days: number): string {
    if (days < 0) return 'เลยกำหนด';
    if (days === 0) return 'วันนี้';
    if (days === 1) return 'พรุ่งนี้';
    return `อีก ${days} วัน`;
  }

  cycleLabel(cycle: string): string {
    const labels: Record<string, string> = { monthly: 'เดือน', yearly: 'ปี', weekly: 'สัปดาห์' };
    return labels[cycle] ?? cycle;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'ใช้งาน',
      paused: 'หยุดชั่วคราว',
      cancelled: 'ยกเลิก',
    };
    return labels[status] ?? status;
  }

  statusSeverity(
    status: string,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'warn' | 'danger'> = {
      active: 'success',
      paused: 'warn',
      cancelled: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  urgencySeverity(days: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (days <= 1) return 'danger';
    if (days <= 3) return 'warn';
    if (days <= 7) return 'info';
    return 'secondary';
  }
}
