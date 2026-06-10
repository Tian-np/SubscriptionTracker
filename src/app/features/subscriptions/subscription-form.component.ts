import { Component, effect, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
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
import { toLocalDateString } from '../../core/utils/date.util';

@Component({
  selector: 'app-subscription-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Button,
    DatePicker,
    InputNumber,
    InputText,
    Message,
    Select,
    Textarea,
    ToggleSwitch,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-medium text-slate-300">ชื่อ</label>
          <input pInputText formControlName="name" class="w-full" placeholder="เช่น Netflix" />
          @if (form.controls.name.touched && form.controls.name.errors?.['required']) {
            <p class="mt-1 text-xs text-red-500">กรุณากรอกชื่อ</p>
          }
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">หมวด</label>
          <p-select
            [formControl]="categoryControl"
            [options]="store.categories()"
            optionLabel="name"
            optionValue="id"
            placeholder="เลือกหมวด"
            appendTo="body"
            class="w-full"
          />
          @if (categoryControl.touched && categoryControl.errors?.['required']) {
            <p class="mt-1 text-xs text-red-500">กรุณาเลือกหมวด</p>
          }
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">สถานะ</label>
          <p-select
            [formControl]="statusControl"
            [options]="statusOptions"
            optionLabel="label"
            optionValue="value"
            appendTo="body"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">จำนวนเงิน</label>
          <p-inputnumber
            [formControl]="amountControl"
            mode="decimal"
            [min]="0.01"
            placeholder="0.00"
            [minFractionDigits]="2"
            class="w-full"
          />
          @if (amountControl.touched && amountControl.errors?.['min']) {
            <p class="mt-1 text-xs text-red-500">จำนวนเงินต้องมากกว่า 0</p>
          }
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">สกุลเงิน</label>
          <p-select
            [formControl]="currencyControl"
            [options]="currencyOptions"
            optionLabel="label"
            optionValue="value"
            appendTo="body"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">รอบบิล</label>
          <p-select
            [formControl]="billingCycleControl"
            [options]="cycleOptions"
            optionLabel="label"
            optionValue="value"
            appendTo="body"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">วันตัดบัตรถัดไป</label>
          <p-datepicker
            [formControl]="nextBillingDateControl"
            dateFormat="dd/mm/yy"
            [showIcon]="true"
            appendTo="body"
            class="w-full"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-300">แจ้งเตือนก่อน (วัน)</label>
          <p-inputnumber [formControl]="remindDaysControl" [min]="0" [max]="30" class="w-full" />
        </div>

        <div class="flex items-center gap-3 md:col-span-2">
          <p-toggleswitch [formControl]="isSharedControl" />
          <label class="text-sm font-medium text-slate-300">Shared subscription</label>
        </div>
      </div>

      @if (isSharedControl.value) {
        <div class="rounded-xl border border-midnight-700 bg-midnight-800/50 p-4">
          <div class="mb-3 flex items-center justify-between">
            <p class="text-sm font-medium text-slate-300">สมาชิกที่แชร์</p>
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
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  pInputText
                  [value]="member.name"
                  (input)="updateMember(i, 'name', $event)"
                  placeholder="ชื่อ"
                  class="w-full flex-1"
                />
                <div class="flex items-center gap-2">
                  <p-inputnumber
                    [ngModel]="member.shareAmount"
                    (ngModelChange)="updateMember(i, 'shareAmount', $event)"
                    [ngModelOptions]="{ standalone: true }"
                    mode="decimal"
                    placeholder="จำนวน"
                    class="w-full flex-1 sm:w-32"
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
              </div>
            }
          </div>
        </div>
      }

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-300">หมายเหตุ</label>
        <textarea
          pTextarea
          formControlName="notes"
          rows="2"
          class="w-full text-slate-300!"
          placeholder="หมายเหตุเพิ่มเติม"
        ></textarea>
      </div>

      @if (store.error()) {
        <p-message severity="error" [text]="store.error()!" />
      }

      <div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <p-button
          type="button"
          label="ยกเลิก"
          severity="secondary"
          [text]="true"
          styleClass="w-full sm:w-auto"
          (onClick)="cancelled.emit()"
        />
        <p-button
          type="submit"
          [label]="subscription() ? 'บันทึก' : 'เพิ่ม'"
          icon="pi pi-check"
          [loading]="saving()"
          [disabled]="form.invalid"
          styleClass="w-full sm:w-auto"
        />
      </div>
    </form>
  `,
})
export class SubscriptionFormComponent {
  readonly subscription = input<Subscription | null>(null);
  readonly formKey = input(0);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly store = inject(SubscriptionStore);
  private readonly fb = inject(FormBuilder);

  readonly sharedMembers = signal<SharedMember[]>([]);
  readonly saving = signal(false);

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

  readonly form = this.fb.group({
    name: ['', Validators.required],
    categoryId: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    currency: ['THB', Validators.required],
    billingCycle: ['monthly' as BillingCycle, Validators.required],
    nextBillingDate: [new Date(), Validators.required],
    status: ['active' as SubscriptionStatus, Validators.required],
    isShared: [false],
    notes: [''],
    remindDaysBefore: [3, [Validators.required, Validators.min(0)]],
  });

  readonly categoryControl = this.form.controls.categoryId as FormControl<string>;
  readonly statusControl = this.form.controls.status as FormControl<SubscriptionStatus>;
  readonly amountControl = this.form.controls.amount as FormControl<number | null>;
  readonly currencyControl = this.form.controls.currency as FormControl<string>;
  readonly billingCycleControl = this.form.controls.billingCycle as FormControl<BillingCycle>;
  readonly nextBillingDateControl = this.form.controls.nextBillingDate as FormControl<Date>;
  readonly remindDaysControl = this.form.controls.remindDaysBefore as FormControl<number>;
  readonly isSharedControl = this.form.controls.isShared as FormControl<boolean>;

  constructor() {
    effect(() => {
      const sub = this.subscription();
      const key = this.formKey();
      void key;

      if (sub) {
        this.loadEditForm(sub);
      } else {
        this.loadNewForm();
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
        i === index ? { ...m, [field]: field === 'shareAmount' ? Number(value) : value } : m,
      ),
    );
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const dto: CreateSubscriptionDto = {
      name: raw.name!,
      categoryId: raw.categoryId!,
      amount: raw.amount!,
      currency: raw.currency!,
      billingCycle: raw.billingCycle!,
      nextBillingDate: toLocalDateString(raw.nextBillingDate!),
      status: raw.status!,
      isShared: raw.isShared!,
      sharedMembers: raw.isShared ? this.sharedMembers() : [],
      notes: raw.notes || undefined,
      remindDaysBefore: raw.remindDaysBefore!,
    };

    this.saving.set(true);
    const existing = this.subscription();
    const op = existing ? this.store.update(existing.id, dto) : this.store.create(dto);

    op.subscribe({
      next: (result) => {
        this.saving.set(false);
        if (result) {
          this.saved.emit();
        }
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  private loadNewForm(): void {
    this.form.reset({
      name: '',
      categoryId: '',
      amount: null,
      currency: 'THB',
      billingCycle: 'monthly',
      nextBillingDate: new Date(),
      status: 'active',
      isShared: false,
      notes: '',
      remindDaysBefore: 3,
    });
    this.form.markAsUntouched();
    this.form.markAsPristine();
    this.sharedMembers.set([]);
    this.saving.set(false);
  }

  private loadEditForm(sub: Subscription): void {
    this.form.reset({
      name: sub.name,
      categoryId: sub.categoryId,
      amount: sub.amount,
      currency: sub.currency,
      billingCycle: sub.billingCycle,
      nextBillingDate: new Date(sub.nextBillingDate + 'T00:00:00'),
      status: sub.status,
      isShared: sub.isShared,
      notes: sub.notes ?? '',
      remindDaysBefore: sub.remindDaysBefore,
    });
    this.form.markAsUntouched();
    this.form.markAsPristine();
    this.sharedMembers.set([...sub.sharedMembers]);
    this.saving.set(false);
  }
}
