import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private idCounter = 0;

  readonly notifications$ = this.notifications.asReadonly();

  show(message: string, type: NotificationType = 'info', duration = 3000): void {
    const id = `notification-${++this.idCounter}`;
    const notification: Notification = { id, message, type, duration };

    this.notifications.update((current) => [...current, notification]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 4000): void {
    this.show(message, 'warning', duration);
  }

  remove(id: string): void {
    this.notifications.update((current) =>
      current.filter((n) => n.id !== id)
    );
  }

  clear(): void {
    this.notifications.set([]);
  }
}
