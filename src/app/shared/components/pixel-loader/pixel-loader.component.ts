import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pixel-loader',
  template: `
    <div class="pixel-loader" [class.pixel-loader--sm]="size() === 'sm'">
      <div class="pixel-loader-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      @if (label()) {
        <p class="pixel-loader-label">{{ label() }}</p>
      }
    </div>
  `,
  styles: `
    .pixel-loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .pixel-loader-dots {
      display: flex;
      gap: 6px;
    }

    .pixel-loader-dots span {
      width: 10px;
      height: 10px;
      background: #6b94ff;
      box-shadow: 0 2px 0 #3b5fbf;
      animation: pixel-loader-bounce 0.6s ease-in-out infinite;
    }

    .pixel-loader-dots span:nth-child(2) {
      background: #fcd34d;
      box-shadow: 0 2px 0 #f59e0b;
      animation-delay: 0.1s;
    }

    .pixel-loader-dots span:nth-child(3) {
      background: #6ee7b7;
      box-shadow: 0 2px 0 #059669;
      animation-delay: 0.2s;
    }

    .pixel-loader-label {
      margin: 0;
      color: #64748b;
      font-size: 0.75rem;
      animation: pixel-text-blink 1.2s step-end infinite;
    }

    .pixel-loader--sm .pixel-loader-dots span {
      width: 7px;
      height: 7px;
    }

    .pixel-loader--sm .pixel-loader-label {
      font-size: 0.65rem;
    }

    @keyframes pixel-loader-bounce {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @keyframes pixel-text-blink {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
    }
  `,
})
export class PixelLoaderComponent {
  readonly label = input('กำลังโหลด...');
  readonly size = input<'sm' | 'md'>('md');
}
