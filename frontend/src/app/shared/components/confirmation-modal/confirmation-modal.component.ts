import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationTypeConfig {
  iconBg: string;
  iconColor: string;
  buttonClasses: string;
  icon: string;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
})
export class ConfirmationModalComponent {
  // Modern signals API
  title = input<string>('Confirmar Ação');
  message = input<string>('Tem a certeza que deseja continuar?');
  confirmButtonText = input<string>('Confirmar');
  cancelButtonText = input<string>('Cancelar');
  type = input<ConfirmationType>('danger');
  customIcon = input<string | null>(null);

  confirm = output<void>();
  cancel = output<void>();

  // Type configurations following Intelly Design Guide
  private readonly typeConfigs: Record<ConfirmationType, ConfirmationTypeConfig> = {
    danger: {
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      buttonClasses: 'bg-pink-600 hover:bg-pink-700 text-white focus:ring-pink-500',
      icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z'
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonClasses: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400',
      icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z'
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonClasses: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonClasses: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  };

  get config(): ConfirmationTypeConfig {
    return this.typeConfigs[this.type()];
  }

  getIconPath(): string {
    return this.customIcon() || this.config.icon;
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    this.cancel.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancel.emit();
    } else if (event.key === 'Enter') {
      this.confirm.emit();
    }
  }
}
