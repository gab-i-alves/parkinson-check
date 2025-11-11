import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pink'
  | 'yellow'
  | 'blue'
  | 'green'
  | 'purple'
  | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      [ngClass]="badgeClasses"
    >
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';

  get badgeClasses(): string {
    const variants: Record<BadgeVariant, string> = {
      primary: 'bg-neutral-900 text-white',
      success: 'bg-green-200 text-neutral-900',
      warning: 'bg-yellow-200 text-neutral-900',
      error: 'bg-red-200 text-neutral-900',
      info: 'bg-blue-200 text-neutral-900',
      pink: 'bg-pink-200 text-neutral-900',
      yellow: 'bg-yellow-200 text-neutral-900',
      blue: 'bg-blue-200 text-neutral-900',
      green: 'bg-green-200 text-neutral-900',
      purple: 'bg-purple-200 text-neutral-900',
      neutral: 'bg-neutral-200 text-neutral-900'
    };

    return variants[this.variant] || variants.neutral;
  }
}
