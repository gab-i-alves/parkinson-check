import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback-modal.component.html',
})
export class FeedbackModalComponent {
  @Input() isVisible: boolean = false;
  @Input() type: FeedbackType = 'success';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() buttonText: string = 'OK';

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  get iconConfig() {
    const configs = {
      success: {
        bgClass: 'bg-green-100',
        iconClass: 'text-green-600',
        iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      error: {
        bgClass: 'bg-red-100',
        iconClass: 'text-red-600',
        iconPath: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      },
      warning: {
        bgClass: 'bg-yellow-100',
        iconClass: 'text-yellow-600',
        iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
      },
      info: {
        bgClass: 'bg-blue-100',
        iconClass: 'text-blue-600',
        iconPath: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
      },
    };
    return configs[this.type];
  }

  get buttonClass() {
    const classes = {
      success: 'bg-green-600 hover:bg-green-700 focus-visible:outline-green-600',
      error: 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600',
      warning: 'bg-yellow-600 hover:bg-yellow-700 focus-visible:outline-yellow-600',
      info: 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600',
    };
    return classes[this.type];
  }
}
