import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { SUPPORTED_CURRENCIES } from '../../core/models/currency.model';
import {
  BillingCycle,
  CreateSubscriptionDto,
  SharedMember,
  Subscription,
  SubscriptionStatus,
} from '../../core/models/subscription.model';
import { SubscriptionStore } from '../../core/stores/subscription.store';

@Component({
  selector: 'app-subscription-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Button,
    DatePicker,
    InputNumber,
    InputText,
    Select,
    Textarea,
    ToggleSwitch,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-slate-700">ชื่อ</label>
          <input pInputText formControlName="name" class="w-full" placeholder="เช่น Netflix" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">หมวด</label>
          <p-select
            formControlName="categoryId"
            [options]="store.categories()"
            optionLabel="name"
            optionValue="id"
            placeholder="เลือกหมวด"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">สถานะ</label>
          <p-select
            formControlName="status"
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">จำนวนเงิน</label>
          <p-inputnumber
            formControlName="amount"
            mode="decimal"
            [minFractionDigits]="2"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">สกุลเงิน</label>
          <p-select
            formControlName="currency"
            [options]="currencyOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">รอบบิล</label>
          <p-select
            formControlName="billingCycle"
            [options]="cycleOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">วันตัดบัตรถัดไป</label>
          <p-datepicker
            formControlName="nextBillingDate"
            dateFormat="dd/mm/yy"
            [showIcon]="true"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">แจ้งเตือนก่อน (วัน)</label>
          <p-inputnumber formControlName="remindDaysBefore" [min]="0" [max]="30" class="w-full" />
        </div>

        <div class="flex items-center gap-3 sm:col-span-2">
          <p-toggleswitch formControlName="isShared" />
          <label class="text-sm font-medium text-slate-700">Shared subscription</label>
        </div>
      </div>

      @if (form.get('isShared')?.value) {
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div class="mb-3 flex items-center justify-between">
            <p class="text-sm font-medium text-slate-700">สมาชิกที่แชร์</p>
            <p-button
              type="button"
              label="เพิ่มสมาชิก"
              icon="pi pi-plus"
              size="small"
              [text]="true"
              (onClick)="addMember()"
            />
          </div>
          <div class="space-y-2">
            @for (member of sharedMembers(); track $index; let i = $index) {
              <div class="flex items-center gap-2">
                <input
                  pInputText
                  [value]="member.name"
                  (input)="updateMember(i, 'name', $event)"
                  placeholder="ชื่อ"
                  class="flex-1"
                />
                <p-inputnumber
                  [ngModel]="member.shareAmount"
                  (ngModelChange)="updateMember(i, 'shareAmount', $event)"
                  [ngModelOptions]="{ standalone: true }"
                  mode="decimal"
                  placeholder="จำนวน"
                  class="w-32"
                />
                <p-button
                  type="button"
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  size="small"
                  (onClick)="removeMember(i)"
                />
              </div>
            }
          </div>
        </div>
      }

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">หมายเหตุ</label>
        <textarea pTextarea formControlName="notes" rows="2" class="w-full" placeholder="หมายเหตุเพิ่มเติม"></textarea>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <p-button type="button" label="ยกเลิก" severity="secondary" [text]="true" (onClick)="cancelled.emit()" />
        <p-button type="submit" [label]="subscription() ? 'บันทึก' : 'เพิ่ม'" icon="pi pi-check" [loading]="store.loading()" />
      </div>
    </form>
  `,
})
export class SubscriptionFormComponent {
  readonly subscription = input<Subscription | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly store = inject(SubscriptionStore);
  private readonly fb = inject(FormBuilder);

  readonly sharedMembers = signal<SharedMember[]>([]);

  readonly statusOptions = [
    { label: 'ใช้งานอยู่', value: 'active' as SubscriptionStatus },
    { label: 'หยุดชั่วคราว', value: 'paused' as SubscriptionStatus },
    { label: 'ยกเลิกแล้ว', value: 'cancelled' as SubscriptionStatus },
  ];

  readonly cycleOptions = [
    { label: 'รายเดือน', value: 'monthly' as BillingCycle },
    { label: 'รายปี', value: 'yearly' as BillingCycle },
    { label: 'รายสัปดาห์', value: 'weekly' as BillingCycle },
  ];

  readonly currencyOptions = SUPPORTED_CURRENCIES.map((c) => ({ label: c, value: c }));

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    categoryId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    currency: ['THB', Validators.required],
    billingCycle: ['monthly' as BillingCycle, Validators.required],
    nextBillingDate: [new Date(), Validators.required],
    status: ['active' as SubscriptionStatus, Validators.required],
    isShared: [false],
    notes: [''],
    remindDaysBefore: [3, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      const sub = this.subscription();
      if (sub) {
        this.form.patchValue({
          ...sub,
          nextBillingDate: new Date(sub.nextBillingDate),
        });
        this.sharedMembers.set([...sub.sharedMembers]);
      } else {
        this.form.reset({
          name: '',
          categoryId: '',
          amount: 0,
          currency: 'THB',
          billingCycle: 'monthly',
          nextBillingDate: new Date(),
          status: 'active',
          isShared: false,
          notes: '',
          remindDaysBefore: 3,
        });
        this.sharedMembers.set([]);
      }
    });
  }

  addMember(): void {
    this.sharedMembers.update((list) => [...list, { name: '', shareAmount: 0 }]);
  }

  removeMember(index: number): void {
    this.sharedMembers.update((list) => list.filter((_, i) => i !== index));
  }

  updateMember(index: number, field: keyof SharedMember, event: Event | number): void {
    const value = typeof event === 'number' ? event : (event.target as HTMLInputElement).value;
    this.sharedMembers.update((list) =>
      list.map((m, i) =>
        i === index
          ? { ...m, [field]: field === 'shareAmount' ? Number(value) : value }
          : m,
      ),
    );
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const dto: CreateSubscriptionDto = {
      ...raw,
      nextBillingDate: this.toDateString(raw.nextBillingDate),
      sharedMembers: raw.isShared ? this.sharedMembers() : [],
    };

    const existing = this.subscription();
    if (existing) {
      this.store.update(existing.id, dto);
    } else {
      this.store.create(dto);
    }
    this.saved.emit();
  }

  private toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
