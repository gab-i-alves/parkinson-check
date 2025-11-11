import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BackendNotificationService } from '../../../core/services/backend-notification.service';
import { UserService } from '../../../core/services/user.service';
import { Notification, NotificationType } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html',
})
export class NotificationCenterComponent implements OnInit {
  private notificationService = inject(BackendNotificationService);
  private userService = inject(UserService);
  private router = inject(Router);

  notifications = signal<Notification[]>([]);
  isLoading = signal<boolean>(false);
  hasUnreadNotifications = computed(() => this.notifications().some(n => !n.read));

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.getAllNotifications().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar notificações:', err);
        this.isLoading.set(false);
      },
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this.notifications.update((notifications) =>
          notifications.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      },
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((notifications) =>
          notifications.map((n) => ({ ...n, read: true }))
        );
      },
    });
  }

  handleNotificationClick(notification: Notification): void {
    this.markAsRead(notification);

    // Navigate based on notification type and user role
    if (notification.bind_id) {
      const currentUser = this.userService.getCurrentUser();

      if (currentUser?.role === 'medico') {
        // Redirect to doctor's binding requests page
        this.router.navigate(['/dashboard/doctor/binding-requests']);
      } else if (currentUser?.role === 'paciente') {
        // Redirect to patient's requests page
        this.router.navigate(['/dashboard/patient-requests']);
      }
    }
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      [NotificationType.BIND_REQUEST]: 'user-plus',
      [NotificationType.BIND_ACCEPTED]: 'check-circle',
      [NotificationType.BIND_REJECTED]: 'x-circle',
      [NotificationType.BIND_REVERSED]: 'user-minus',
    };
    return icons[type];
  }

  getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      [NotificationType.BIND_REQUEST]: 'text-blue-600',
      [NotificationType.BIND_ACCEPTED]: 'text-green-600',
      [NotificationType.BIND_REJECTED]: 'text-red-600',
      [NotificationType.BIND_REVERSED]: 'text-neutral-600',
    };
    return colors[type];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;

    return date.toLocaleDateString('pt-BR');
  }
}
