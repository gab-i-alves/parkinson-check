import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackTypeConfig {
  bgClass: string;
  iconClass: string;
  buttonClass: string;
  iconPath: string;
}

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback-modal.component.html',
})
export class FeedbackModalComponent {
  // Modern signals API
  isVisible = input<boolean>(false);
  type = input<FeedbackType>('success');
  title = input<string>('');
  message = input<string>('');
  buttonText = input<string>('OK');
  details = input<string[]>([]);
  primaryAction = input<string | null>(null);
  secondaryAction = input<string | null>(null);

  close = output<void>();
  primary = output<void>();
  secondary = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onPrimary(): void {
    this.primary.emit();
  }

  onSecondary(): void {
    this.secondary.emit();
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close.emit();
    }
  }

  // Type configurations following Intelly Design Guide (200-level colors)
  private readonly typeConfigs: Record<FeedbackType, FeedbackTypeConfig> = {
    success: {
      bgClass: 'bg-green-100',
      iconClass: 'text-green-600',
      buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    error: {
      bgClass: 'bg-pink-100',
      iconClass: 'text-pink-600',
      buttonClass: 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-500',
      iconPath: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    warning: {
      bgClass: 'bg-yellow-100',
      iconClass: 'text-yellow-600',
      buttonClass: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400',
      iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    },
    info: {
      bgClass: 'bg-blue-100',
      iconClass: 'text-blue-600',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      iconPath: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
    },
  };

  get config(): FeedbackTypeConfig {
    return this.typeConfigs[this.type()];
  }
}
