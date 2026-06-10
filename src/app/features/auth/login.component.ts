import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';

import { SupabaseAuthService } from '../../core/services/supabase-auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, Button, InputText, Password, Message],
  template: `
    <div class="flex min-h-dvh-safe items-center justify-center bg-slate-50 px-4 px-safe pt-safe pb-safe">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div class="mb-6 text-center">
          <div
            class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white"
          >
            <i class="pi pi-wallet"></i>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">SubTracker</h1>
          <p class="mt-1 text-sm text-slate-500">{{ isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ' }}</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">ชื่อผู้ใช้</label>
            <input
              pInputText
              formControlName="username"
              class="w-full"
              placeholder="เช่น naphat"
              autocomplete="username"
            />
            @if (isSignUp) {
              <p class="mt-1 text-xs text-slate-400">a-z, 0-9, _ ความยาว 3–20 ตัว</p>
            }
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">รหัสผ่าน</label>
            <p-password
              formControlName="password"
              [feedback]="isSignUp"
              [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="w-full"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          @if (auth.authError()) {
            <p-message severity="error" [text]="auth.authError()!" />
          }

          <p-button
            type="submit"
            [label]="isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'"
            icon="pi pi-sign-in"
            class="w-full"
            styleClass="w-full"
            [loading]="loading"
            [disabled]="form.invalid"
          />
        </form>

        <p class="mt-4 text-center text-sm text-slate-500">
          {{ isSignUp ? 'มีบัญชีแล้ว?' : 'ยังไม่มีบัญชี?' }}
          <button type="button" class="font-medium text-indigo-600 hover:underline" (click)="toggleMode()">
            {{ isSignUp ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก' }}
          </button>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly auth = inject(SupabaseAuthService);

  isSignUp = false;
  loading = false;

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  readonly form = this.fb.nonNullable.group({
    username: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_]+$/)],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.auth.authError.set(null);
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const { username, password } = this.form.getRawValue();
    const op = this.isSignUp
      ? this.auth.signUp(username, password)
      : this.auth.signIn(username, password);

    op.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
