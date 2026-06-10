import {
  booleanAttribute,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { SubbyMood, SubbyService, SubbyVariant } from '../../../core/services/subby.service';

export type PixelBuddyMood = SubbyMood;

@Component({
  selector: 'app-pixel-buddy',
  template: `
    <div
      class="pixel-buddy-wrap"
      [class.pixel-buddy--wave]="displayMood() === 'wave'"
      [class.pixel-buddy--sad]="displayMood() === 'sad'"
      [class.pixel-buddy--excited]="displayMood() === 'excited'"
      [class.pixel-buddy--variant-success]="displayVariant() === 'success'"
      [class.pixel-buddy--variant-warning]="displayVariant() === 'warning'"
      [class.pixel-buddy--variant-danger]="displayVariant() === 'danger'"
      [class.pixel-buddy--variant-celebrate]="displayVariant() === 'celebrate'"
      [style.--buddy-size.px]="size()"
    >
      @if (displaySpeech()) {
        <div
          class="pixel-speech"
          [class.pixel-speech--pop]="speechPop()"
          [class.pixel-speech--success]="displayVariant() === 'success'"
          [class.pixel-speech--warning]="displayVariant() === 'warning'"
          [class.pixel-speech--danger]="displayVariant() === 'danger'"
          [class.pixel-speech--celebrate]="displayVariant() === 'celebrate'"
        >
          {{ displaySpeech() }}
        </div>
      }

      <svg
        viewBox="0 0 16 20"
        xmlns="http://www.w3.org/2000/svg"
        shape-rendering="crispEdges"
        class="pixel-buddy-svg"
        aria-hidden="true"
      >
        <rect x="7" y="0" width="2" height="1" class="buddy-sparkle" />
        <rect x="6" y="1" width="1" height="1" class="buddy-sparkle-alt pixel-sparkle--delay" />

        <g class="pixel-arm">
          <rect x="0" y="6" width="2" height="1" class="buddy-arm" />
          <rect x="1" y="5" width="2" height="1" class="buddy-body-light" />
          <rect x="2" y="4" width="2" height="2" class="buddy-body-light" />
        </g>

        <rect x="5" y="1" width="6" height="1" class="buddy-body-light" />
        <rect x="4" y="2" width="8" height="1" class="buddy-body-light" />
        <rect x="3" y="3" width="10" height="1" class="buddy-body-light" />
        <rect x="3" y="4" width="10" height="5" class="buddy-body-light" />
        <rect x="4" y="9" width="8" height="3" class="buddy-body-mid" />
        <rect x="5" y="12" width="6" height="1" class="buddy-body-dark" />

        <g class="pixel-eyes">
          <rect x="4" y="5" width="2" height="2" fill="#0f172a" />
          <rect x="4" y="5" width="1" height="1" fill="#f8fafc" />
          <rect x="10" y="5" width="2" height="2" fill="#0f172a" />
          <rect x="11" y="5" width="1" height="1" fill="#f8fafc" />
        </g>

        <rect x="3" y="7" width="1" height="1" class="buddy-cheek" />
        <rect x="12" y="7" width="1" height="1" class="buddy-cheek" />

        <g class="mouth-happy">
          <rect x="6" y="8" width="4" height="1" fill="#334155" />
          <rect x="5" y="9" width="1" height="1" fill="#334155" />
          <rect x="10" y="9" width="1" height="1" fill="#334155" />
        </g>

        <g class="mouth-sad">
          <rect x="5" y="9" width="1" height="1" fill="#334155" />
          <rect x="10" y="9" width="1" height="1" fill="#334155" />
          <rect x="6" y="8" width="4" height="1" fill="#334155" />
        </g>

        <rect x="4" y="13" width="3" height="2" class="buddy-feet" />
        <rect x="9" y="13" width="3" height="2" class="buddy-feet" />

        <g class="pixel-coin">
          <rect x="6" y="15" width="4" height="1" class="buddy-coin-dark" />
          <rect x="5" y="16" width="6" height="2" class="buddy-coin" />
          <rect x="6" y="18" width="4" height="1" class="buddy-coin-dark" />
          <rect x="7" y="16" width="2" height="1" class="buddy-coin-shine" />
        </g>

        <rect x="3" y="19" width="10" height="1" class="buddy-shadow" opacity="0.6" />
      </svg>
    </div>
  `,
  styles: `
    .pixel-buddy-wrap {
      --buddy-body-light: #6b94ff;
      --buddy-body-mid: #5b84ff;
      --buddy-body-dark: #4d7cff;
      --buddy-feet: #3b5fbf;
      --buddy-arm: #5b84ff;
      --buddy-cheek: #fda4af;
      --buddy-sparkle: #fcd34d;
      --buddy-sparkle-alt: #fde68a;
      --buddy-coin: #fcd34d;
      --buddy-coin-dark: #f59e0b;
      --buddy-coin-shine: #fde68a;
      --buddy-shadow: #1a2744;
      --buddy-drop-shadow: rgb(59 95 191 / 0.35);
      --buddy-speech-border: #4d7cff;
      --buddy-speech-shadow: #3b5fbf;

      position: relative;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      width: var(--buddy-size, 64px);
      animation: pixel-bob 2.4s ease-in-out infinite;
    }

    .buddy-body-light {
      fill: var(--buddy-body-light);
    }
    .buddy-body-mid {
      fill: var(--buddy-body-mid);
    }
    .buddy-body-dark {
      fill: var(--buddy-body-dark);
    }
    .buddy-feet {
      fill: var(--buddy-feet);
    }
    .buddy-arm {
      fill: var(--buddy-arm);
    }
    .buddy-cheek {
      fill: var(--buddy-cheek);
    }
    .buddy-sparkle {
      fill: var(--buddy-sparkle);
    }
    .buddy-sparkle-alt {
      fill: var(--buddy-sparkle-alt);
    }
    .buddy-coin {
      fill: var(--buddy-coin);
    }
    .buddy-coin-dark {
      fill: var(--buddy-coin-dark);
    }
    .buddy-coin-shine {
      fill: var(--buddy-coin-shine);
    }
    .buddy-shadow {
      fill: var(--buddy-shadow);
    }

    .pixel-buddy--variant-success {
      --buddy-body-light: #6ee7b7;
      --buddy-body-mid: #34d399;
      --buddy-body-dark: #10b981;
      --buddy-feet: #059669;
      --buddy-arm: #6ee7b7;
      --buddy-drop-shadow: rgb(5 150 105 / 0.35);
      --buddy-speech-border: #34d399;
      --buddy-speech-shadow: #059669;
    }

    .pixel-buddy--variant-warning {
      --buddy-body-light: #fcd34d;
      --buddy-body-mid: #fbbf24;
      --buddy-body-dark: #f59e0b;
      --buddy-feet: #d97706;
      --buddy-arm: #fde68a;
      --buddy-drop-shadow: rgb(217 119 6 / 0.35);
      --buddy-speech-border: #fbbf24;
      --buddy-speech-shadow: #d97706;
    }

    .pixel-buddy--variant-danger {
      --buddy-body-light: #fca5a5;
      --buddy-body-mid: #f87171;
      --buddy-body-dark: #ef4444;
      --buddy-feet: #dc2626;
      --buddy-arm: #fca5a5;
      --buddy-cheek: #fecaca;
      --buddy-drop-shadow: rgb(220 38 38 / 0.35);
      --buddy-speech-border: #f87171;
      --buddy-speech-shadow: #dc2626;
    }

    .pixel-buddy--variant-celebrate {
      --buddy-body-light: #c4b5fd;
      --buddy-body-mid: #a78bfa;
      --buddy-body-dark: #8b5cf6;
      --buddy-feet: #7c3aed;
      --buddy-arm: #ddd6fe;
      --buddy-sparkle: #f9a8d4;
      --buddy-sparkle-alt: #fbcfe8;
      --buddy-drop-shadow: rgb(124 58 237 / 0.35);
      --buddy-speech-border: #a78bfa;
      --buddy-speech-shadow: #7c3aed;
    }

    .pixel-buddy-svg {
      width: var(--buddy-size, 64px);
      height: calc(var(--buddy-size, 64px) * 1.25);
      image-rendering: pixelated;
      filter: drop-shadow(0 4px 0 var(--buddy-drop-shadow));
    }

    .pixel-eyes {
      transform-origin: center;
      animation: pixel-blink 4s step-end infinite;
    }

    .pixel-coin {
      animation: pixel-coin-spin 3s ease-in-out infinite;
      transform-origin: 8px 17px;
    }

    .buddy-sparkle,
    .buddy-sparkle-alt {
      animation: pixel-twinkle 1.5s ease-in-out infinite;
    }

    .pixel-sparkle--delay {
      animation-delay: 0.75s;
    }

    .pixel-arm {
      display: none;
      transform-origin: 3px 6px;
    }

    .mouth-sad {
      display: none;
    }

    .pixel-buddy--wave .pixel-arm {
      display: block;
      animation: pixel-wave 0.6s ease-in-out infinite;
    }

    .pixel-buddy--sad .mouth-happy {
      display: none;
    }

    .pixel-buddy--sad .mouth-sad {
      display: block;
    }

    .pixel-buddy--sad {
      animation: pixel-bob-slow 3s ease-in-out infinite;
    }

    .pixel-buddy--excited {
      animation: pixel-bounce 0.8s ease-in-out infinite;
    }

    .pixel-speech {
      position: relative;
      margin-bottom: 0.5rem;
      max-width: 12rem;
      padding: 0.45rem 0.65rem;
      border: 2px solid var(--buddy-speech-border);
      background: #0f1729;
      box-shadow: 3px 3px 0 var(--buddy-speech-shadow);
      color: #cbd5e1;
      font-size: 0.7rem;
      line-height: 1.35;
      text-align: center;
    }

    .pixel-speech::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      width: 8px;
      height: 8px;
      margin-left: -4px;
      background: #0f1729;
      border-right: 2px solid var(--buddy-speech-border);
      border-bottom: 2px solid var(--buddy-speech-border);
      transform: rotate(45deg);
    }

    .pixel-speech--pop {
      animation: pixel-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes pixel-bob {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }

    @keyframes pixel-bob-slow {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-3px);
      }
    }

    @keyframes pixel-bounce {
      0%,
      100% {
        transform: translateY(0) scale(1);
      }
      30% {
        transform: translateY(-8px) scale(1.05);
      }
      50% {
        transform: translateY(-4px) scale(0.98);
      }
    }

    @keyframes pixel-blink {
      0%,
      92%,
      100% {
        transform: scaleY(1);
      }
      96% {
        transform: scaleY(0.15);
      }
    }

    @keyframes pixel-coin-spin {
      0%,
      100% {
        transform: rotate(-4deg);
      }
      50% {
        transform: rotate(4deg);
      }
    }

    @keyframes pixel-twinkle {
      0%,
      100% {
        opacity: 0.4;
      }
      50% {
        opacity: 1;
      }
    }

    @keyframes pixel-wave {
      0%,
      100% {
        transform: rotate(0deg);
      }
      50% {
        transform: rotate(-18deg);
      }
    }

    @keyframes pixel-pop {
      from {
        opacity: 0;
        transform: scale(0.85) translateY(4px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `,
})
export class PixelBuddyComponent {
  private readonly subby = inject(SubbyService);

  readonly mood = input<SubbyMood | null>(null);
  readonly variant = input<SubbyVariant | null>(null);
  readonly speech = input<string | null | undefined>(undefined);
  readonly size = input(64);
  readonly animateSpeech = input(true);
  /** Bind mood / variant / speech to SubbyService events */
  readonly sync = input(false, { transform: booleanAttribute });

  readonly speechPop = signal(false);

  readonly displayMood = computed(() =>
    this.sync() ? this.subby.state().mood : (this.mood() ?? 'happy'),
  );

  readonly displayVariant = computed(() =>
    this.sync() ? this.subby.state().variant : (this.variant() ?? 'default'),
  );

  readonly displaySpeech = computed(() => {
    if (this.sync()) return this.subby.state().speech;
    const s = this.speech();
    return s === undefined ? null : s;
  });

  constructor() {
    effect(() => {
      if (this.sync()) {
        void this.subby.state().tick;
      } else if (this.animateSpeech()) {
        void this.displaySpeech();
      } else {
        return;
      }
      this.speechPop.set(false);
      requestAnimationFrame(() => this.speechPop.set(true));
    });
  }
}
