import { Component } from '@angular/core';

interface PixelStar {
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

@Component({
  selector: 'app-pixel-bg',
  template: `
    <div class="pixel-bg" aria-hidden="true">
      @for (star of stars; track $index) {
        <span
          class="pixel-star"
          [style.left.%]="star.x"
          [style.top.%]="star.y"
          [style.width.px]="star.size"
          [style.height.px]="star.size"
          [style.animation-delay.s]="star.delay"
          [style.background]="star.color"
        ></span>
      }
      <span class="pixel-cloud pixel-cloud--1"></span>
      <span class="pixel-cloud pixel-cloud--2"></span>
    </div>
  `,
  styles: `
    .pixel-bg {
      pointer-events: none;
      position: fixed;
      inset: 0;
      z-index: 0;
      overflow: hidden;
    }

    .pixel-star {
      position: absolute;
      border-radius: 0;
      opacity: 0.35;
      animation: pixel-star-pulse 3s ease-in-out infinite;
      image-rendering: pixelated;
    }

    .pixel-cloud {
      position: absolute;
      border-radius: 0;
      opacity: 0.04;
      background: #6b94ff;
      image-rendering: pixelated;
    }

    .pixel-cloud--1 {
      top: 12%;
      right: 8%;
      width: 48px;
      height: 16px;
      box-shadow:
        -12px 8px 0 #6b94ff,
        12px 8px 0 #6b94ff,
        0 16px 0 #6b94ff;
      animation: pixel-cloud-drift 18s linear infinite;
    }

    .pixel-cloud--2 {
      bottom: 22%;
      left: 5%;
      width: 32px;
      height: 12px;
      box-shadow:
        -8px 6px 0 #8eb0ff,
        8px 6px 0 #8eb0ff,
        0 12px 0 #8eb0ff;
      animation: pixel-cloud-drift 24s linear infinite reverse;
    }

    @keyframes pixel-star-pulse {
      0%,
      100% {
        opacity: 0.15;
        transform: scale(1);
      }
      50% {
        opacity: 0.55;
        transform: scale(1.3);
      }
    }

    @keyframes pixel-cloud-drift {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(30px);
      }
    }
  `,
})
export class PixelBgComponent {
  readonly stars: PixelStar[] = [
    { x: 8, y: 15, size: 3, delay: 0, color: '#8eb0ff' },
    { x: 22, y: 8, size: 2, delay: 0.5, color: '#fcd34d' },
    { x: 75, y: 12, size: 3, delay: 1, color: '#6ee7b7' },
    { x: 88, y: 25, size: 2, delay: 1.5, color: '#fda4af' },
    { x: 15, y: 45, size: 2, delay: 0.8, color: '#8eb0ff' },
    { x: 92, y: 55, size: 3, delay: 2, color: '#fcd34d' },
    { x: 5, y: 72, size: 2, delay: 1.2, color: '#6b94ff' },
    { x: 68, y: 78, size: 2, delay: 0.3, color: '#fda4af' },
    { x: 45, y: 5, size: 2, delay: 2.2, color: '#6ee7b7' },
    { x: 55, y: 88, size: 3, delay: 1.8, color: '#8eb0ff' },
    { x: 35, y: 65, size: 2, delay: 0.6, color: '#fcd34d' },
    { x: 82, y: 42, size: 2, delay: 2.5, color: '#6b94ff' },
  ];
}
