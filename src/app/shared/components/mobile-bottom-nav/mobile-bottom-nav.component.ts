import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mobile-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav
      class="fixed inset-x-0 bottom-0 z-50 border-t border-midnight-700 bg-midnight-900/95 backdrop-blur-md md:hidden"
    >
      <div class="flex items-stretch px-safe pb-safe pt-1">
        <a
          routerLink="/"
          routerLinkActive="text-accent"
          [routerLinkActiveOptions]="{ exact: true }"
          class="touch-target flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium text-slate-500 transition active:scale-95 [&.text-accent]:text-accent"
        >
          <i class="pi pi-home text-[1.35rem]"></i>
          <span>หน้าหลัก</span>
        </a>

        <a
          routerLink="/subscriptions"
          routerLinkActive="text-accent"
          class="touch-target flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium text-slate-500 transition active:scale-95 [&.text-accent]:text-accent"
        >
          <i class="pi pi-list text-[1.35rem]"></i>
          <span>รายการ</span>
        </a>

        <button
          type="button"
          class="touch-target flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium text-slate-500 transition active:scale-95"
          (click)="openAdd()"
        >
          <span
            class="pixel-fab flex h-9 w-9 items-center justify-center rounded-lg border-2 border-accent/40 bg-accent text-white"
          >
            <i class="pi pi-plus text-sm"></i>
          </span>
          <span>เพิ่ม</span>
        </button>
      </div>
    </nav>
  `,
})
export class MobileBottomNavComponent {
  private readonly router = inject(Router);

  openAdd(): void {
    this.router.navigate(['/subscriptions'], { queryParams: { action: 'add' } });
  }
}
