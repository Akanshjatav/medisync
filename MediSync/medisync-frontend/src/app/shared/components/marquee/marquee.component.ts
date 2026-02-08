import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marquee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="marquee-container" [class.paused]="pauseOnHover && isHovered" [class.reverse]="reverse" (mouseenter)="isHovered = true" (mouseleave)="isHovered = false">
      <div class="marquee-content" [style.animation-duration]="animationDuration" [style.gap]="gap">
        <ng-content></ng-content>
      </div>
      <div class="marquee-content" [style.animation-duration]="animationDuration" [style.gap]="gap" aria-hidden="true">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      overflow: hidden;
      width: 100%;
    }

    .marquee-container {
      display: flex;
      overflow: hidden;
      user-select: none;
      gap: var(--marquee-gap, 1rem);
    }

    .marquee-content {
      display: flex;
      gap: var(--marquee-gap, 1rem);
      animation: scroll var(--animation-duration, 20s) linear infinite;
      flex-shrink: 0;
      min-width: 100%;
    }

    .marquee-container.paused .marquee-content {
      animation-play-state: paused;
    }

    .marquee-container.reverse .marquee-content {
      animation-name: scroll-reverse;
    }

    @keyframes scroll {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(calc(-100% - var(--marquee-gap, 1rem)));
      }
    }

    @keyframes scroll-reverse {
      from {
        transform: translateX(calc(-100% - var(--marquee-gap, 1rem)));
      }
      to {
        transform: translateX(0);
      }
    }

    :host ::ng-deep .marquee-content > * {
      flex-shrink: 0;
    }
  `]
})
export class MarqueeComponent {
  @Input() animationDuration: string = '20s';
  @Input() gap: string = '1rem';
  @Input() pauseOnHover: boolean = true;
  @Input() reverse: boolean = false;
  
  isHovered = false;
}
