import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router} from '@angular/router';
import { BackendNotificationService } from '../../../core/services/backend-notification.service';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        (click)="toggleNotifications()"
        class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-md"
        [attr.aria-label]="'Notificações' + (unreadCount() > 0 ? ' (' + unreadCount() + ' não lidas)' : '')"
      >
        <!-- Bell icon -->
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>

        <!-- Badge counter -->
        @if (unreadCount() > 0) {
          <span class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {{ unreadCount() > 99 ? '99+' : unreadCount() }}
          </span>
        }
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  private notificationService = inject(BackendNotificationService);
  private router = inject(Router);

  unreadCount = this.notificationService.unreadCount$;

  ngOnInit(): void {
    // Start polling every 30 seconds
    this.notificationService.startPolling(30000);
  }

  ngOnDestroy(): void {
    this.notificationService.stopPolling();
  }

  toggleNotifications(): void {
    // Navigate to notifications center
    this.router.navigate(['/dashboard/notifications']);
  }
}
