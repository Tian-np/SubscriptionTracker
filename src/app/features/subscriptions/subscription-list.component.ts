import { Component, inject, OnInit, signal } from '@angular/core';
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
import { SubscriptionStore } from '../../core/stores/subscription.store';
import { daysUntil } from '../../core/utils/currency.util';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
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
    SubscriptionFormComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <p-confirmDialog />

    <div class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Subscriptions</h2>
          <p class="text-sm text-slate-500">จัดการรายการ subscription ทั้งหมด</p>
        </div>
        <p-button label="เพิ่มใหม่" icon="pi pi-plus" (onClick)="openAddDialog()" />
      </div>

      <!-- Filters -->
      <div class="flex flex-col gap-3 sm:flex-row">
        <p-iconfield class="flex-1">
          <p-inputicon class="pi pi-search" />
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
          <i class="pi pi-spin pi-spinner text-3xl text-indigo-500"></i>
        </div>
      } @else if (store.filteredSubscriptions().length === 0) {
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <i class="pi pi-inbox mb-3 text-4xl text-slate-300"></i>
          <p class="text-slate-500">ไม่พบ subscription</p>
          <p-button
            label="เพิ่มรายการแรก"
            icon="pi pi-plus"
            class="mt-4"
            (onClick)="openAddDialog()"
          />
        </div>
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (sub of store.filteredSubscriptions(); track sub.id) {
            <div
              class="group rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
              [class.border-slate-200]="sub.status === 'active'"
              [class.border-rose-200]="sub.status === 'cancelled'"
              [class.opacity-70]="sub.status !== 'active'"
            >
              <div class="mb-3 flex items-start justify-between">
                <div class="flex items-center gap-3">
                  @if (store.getCategoryById(sub.categoryId); as cat) {
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                      [style.background-color]="cat.color"
                    >
                      <i [class]="cat.icon"></i>
                    </div>
                  }
                  <div>
                    <h3 class="font-semibold text-slate-900">{{ sub.name }}</h3>
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

              <div class="mb-4 space-y-1">
                <p class="text-2xl font-bold text-slate-900">
                  {{ sub.amount | currencyFormat: sub.currency }}
                  <span class="text-sm font-normal text-slate-500">/{{ cycleLabel(sub.billingCycle) }}</span>
                </p>
                @if (sub.status === 'active') {
                  <p class="text-sm text-slate-500">
                    ตัดบัตร: {{ formatDate(sub.nextBillingDate) }}
                    <p-tag
                      [value]="daysLabel(daysUntil(sub.nextBillingDate))"
                      [severity]="urgencySeverity(daysUntil(sub.nextBillingDate))"
                      class="ml-1 text-xs"
                    />
                  </p>
                }
                @if (sub.isShared) {
                  <p-tag value="Shared" icon="pi pi-users" severity="info" [rounded]="true" class="text-xs" />
                }
              </div>

              @if (sub.notes) {
                <p class="mb-3 text-xs text-slate-400 italic">{{ sub.notes }}</p>
              }

              <div class="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  size="small"
                  (onClick)="openEditDialog(sub)"
                />
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  size="small"
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
      [style]="{ width: '600px' }"
      [breakpoints]="{ '640px': '95vw' }"
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

  readonly dialogVisible = signal(false);
  readonly editingSubscription = signal<Subscription | null>(null);
  readonly formKey = signal(0);

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

  statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
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
