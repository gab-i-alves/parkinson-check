import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  show(toast: Omit<Toast, 'id'>): void {
    const id = this.generateId();
    const duration = toast.duration || 5000;

    const newToast: Toast = {
      ...toast,
      id
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, title?: string, duration?: number): void {
    this.show({ message, title, type: 'success', duration });
  }

  error(message: string, title?: string, duration?: number): void {
    this.show({ message, title, type: 'error', duration });
  }

  warning(message: string, title?: string, duration?: number): void {
    this.show({ message, title, type: 'warning', duration });
  }

  info(message: string, title?: string, duration?: number): void {
    this.show({ message, title, type: 'info', duration });
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
