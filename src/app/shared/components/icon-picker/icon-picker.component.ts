import { Component, computed, input, output } from '@angular/core';

import { getIconsForCategory } from '../../../core/models/icon-options.model';

@Component({
  selector: 'app-icon-picker',
  template: `
    <div class="icon-picker">
      <p class="mb-2 text-xs text-slate-500">
        เลือกไอคอน
        @if (selected(); as current) {
          <span class="text-slate-400">— ปัจจุบัน: <i [class]="current + ' ml-1'"></i></span>
        }
      </p>
      <div class="icon-picker-grid">
        @for (opt of icons(); track opt.value) {
          <button
            type="button"
            class="icon-picker-btn"
            [class.icon-picker-btn--active]="selected() === opt.value"
            [title]="opt.label"
            (click)="pick(opt.value)"
          >
            <i [class]="opt.value"></i>
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    .icon-picker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(2.5rem, 1fr));
      gap: 0.4rem;
      max-height: 9.5rem;
      overflow-y: auto;
      padding: 0.15rem;
    }

    .icon-picker-btn {
      display: flex;
      aspect-ratio: 1;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--color-midnight-600, #243352);
      border-radius: 0.5rem;
      background: var(--color-midnight-800, #131d33);
      color: #94a3b8;
      font-size: 1rem;
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        background-color 0.15s ease,
        color 0.15s ease,
        transform 0.1s ease;
    }

    .icon-picker-btn:hover {
      border-color: #4d7cff;
      background: #1a2744;
      color: #e2e8f0;
    }

    .icon-picker-btn--active {
      border-color: #6b94ff;
      background: rgb(77 124 255 / 0.18);
      color: #8eb0ff;
      box-shadow: 0 2px 0 #3b5fbf;
    }

    .icon-picker-btn:active {
      transform: scale(0.94);
    }
  `,
})
export class IconPickerComponent {
  readonly categoryId = input<string | null>(null);
  readonly selected = input<string | null>(null);
  readonly selectedChange = output<string>();

  readonly icons = computed(() => getIconsForCategory(this.categoryId()));

  pick(value: string): void {
    this.selectedChange.emit(value);
  }
}
