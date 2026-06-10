import { Component, input } from '@angular/core';

export type PixelBuddyMood = 'happy' | 'wave' | 'sad' | 'excited';

@Component({
  selector: 'app-pixel-buddy',
  template: `
    <div
      class="pixel-buddy-wrap"
      [class.pixel-buddy--wave]="mood() === 'wave'"
      [class.pixel-buddy--sad]="mood() === 'sad'"
      [class.pixel-buddy--excited]="mood() === 'excited'"
      [style.--buddy-size.px]="size()"
    >
      @if (speech()) {
        <div class="pixel-speech" [class.pixel-speech--pop]="animateSpeech()">
          {{ speech() }}
        </div>
      }

      <svg
        viewBox="0 0 16 20"
        xmlns="http://www.w3.org/2000/svg"
        shape-rendering="crispEdges"
        class="pixel-buddy-svg"
        aria-hidden="true"
      >
        <!-- sparkle -->
        <rect x="7" y="0" width="2" height="1" fill="#fcd34d" class="pixel-sparkle" />
        <rect x="6" y="1" width="1" height="1" fill="#fde68a" class="pixel-sparkle pixel-sparkle--delay" />

        <!-- wave arm -->
        <g class="pixel-arm">
          <rect x="0" y="6" width="2" height="1" fill="#5b84ff" />
          <rect x="1" y="5" width="2" height="1" fill="#6b94ff" />
          <rect x="2" y="4" width="2" height="2" fill="#6b94ff" />
        </g>

        <!-- head & body -->
        <rect x="5" y="1" width="6" height="1" fill="#6b94ff" />
        <rect x="4" y="2" width="8" height="1" fill="#6b94ff" />
        <rect x="3" y="3" width="10" height="1" fill="#6b94ff" />
        <rect x="3" y="4" width="10" height="5" fill="#6b94ff" />
        <rect x="4" y="9" width="8" height="3" fill="#5b84ff" />
        <rect x="5" y="12" width="6" height="1" fill="#4d7cff" />

        <!-- eyes -->
        <g class="pixel-eyes">
          <rect x="4" y="5" width="2" height="2" fill="#0f172a" />
          <rect x="4" y="5" width="1" height="1" fill="#f8fafc" />
          <rect x="10" y="5" width="2" height="2" fill="#0f172a" />
          <rect x="11" y="5" width="1" height="1" fill="#f8fafc" />
        </g>

        <!-- cheeks -->
        <rect x="3" y="7" width="1" height="1" fill="#fda4af" />
        <rect x="12" y="7" width="1" height="1" fill="#fda4af" />

        <!-- happy mouth -->
        <g class="mouth-happy">
          <rect x="6" y="8" width="4" height="1" fill="#334155" />
          <rect x="5" y="9" width="1" height="1" fill="#334155" />
          <rect x="10" y="9" width="1" height="1" fill="#334155" />
        </g>

        <!-- sad mouth -->
        <g class="mouth-sad">
          <rect x="5" y="9" width="1" height="1" fill="#334155" />
          <rect x="10" y="9" width="1" height="1" fill="#334155" />
          <rect x="6" y="8" width="4" height="1" fill="#334155" />
        </g>

        <!-- feet -->
        <rect x="4" y="13" width="3" height="2" fill="#3b5fbf" />
        <rect x="9" y="13" width="3" height="2" fill="#3b5fbf" />

        <!-- coin -->
        <g class="pixel-coin">
          <rect x="6" y="15" width="4" height="1" fill="#f59e0b" />
          <rect x="5" y="16" width="6" height="2" fill="#fcd34d" />
          <rect x="6" y="18" width="4" height="1" fill="#f59e0b" />
          <rect x="7" y="16" width="2" height="1" fill="#fde68a" />
        </g>

        <!-- shadow -->
        <rect x="3" y="19" width="10" height="1" fill="#1a2744" opacity="0.6" />
      </svg>
    </div>
  `,
  styles: `
    .pixel-buddy-wrap {
      position: relative;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      width: var(--buddy-size, 64px);
      animation: pixel-bob 2.4s ease-in-out infinite;
    }

    .pixel-buddy-svg {
      width: var(--buddy-size, 64px);
      height: calc(var(--buddy-size, 64px) * 1.25);
      image-rendering: pixelated;
      filter: drop-shadow(0 4px 0 rgb(59 95 191 / 0.35));
    }

    .pixel-eyes {
      transform-origin: center;
      animation: pixel-blink 4s step-end infinite;
    }

    .pixel-coin {
      animation: pixel-coin-spin 3s ease-in-out infinite;
      transform-origin: 8px 17px;
    }

    .pixel-sparkle {
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
      max-width: 11rem;
      padding: 0.45rem 0.65rem;
      border: 2px solid #4d7cff;
      background: #0f1729;
      box-shadow: 3px 3px 0 #3b5fbf;
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
      border-right: 2px solid #4d7cff;
      border-bottom: 2px solid #4d7cff;
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
  readonly mood = input<PixelBuddyMood>('happy');
  readonly size = input(64);
  readonly speech = input<string | null>(null);
  readonly animateSpeech = input(true);
}
