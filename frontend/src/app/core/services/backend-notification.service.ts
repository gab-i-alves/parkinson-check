import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, interval, Subscription, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notification, UnreadNotificationCount } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class BackendNotificationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/notifications`;

  // Reactive state
  private unreadCount = signal<number>(0);
  private notifications = signal<Notification[]>([]);

  // Polling subscription
  private pollingSubscription?: Subscription;

  readonly unreadCount$ = this.unreadCount.asReadonly();
  readonly notifications$ = this.notifications.asReadonly();

  private getHttpOptions() {
    const token = localStorage.getItem('auth_token');
    return {
      observe: 'response' as const,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  /**
   * Start polling for notifications
   * @param intervalMs Polling interval in milliseconds (default: 30s)
   */
  startPolling(intervalMs: number = 30000): void {
    this.stopPolling(); // Stop previous polling if exists

    // Load immediately
    this.loadUnreadCount();

    // Start polling
    this.pollingSubscription = interval(intervalMs)
      .pipe(switchMap(() => this.getUnreadCount()))
      .subscribe({
        next: (count) => this.unreadCount.set(count),
        error: (err) => console.error('Error polling notifications:', err),
      });
  }

  /**
   * Stop polling for notifications
   */
  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
  }

  /**
   * Load unread notification count
   */
  private loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count),
      error: (err) => console.error('Error loading notifications:', err),
    });
  }

  /**
   * Get unread notification count
   */
  private getUnreadCount(): Observable<number> {
    return this.http
      .get<UnreadNotificationCount>(`${this.baseUrl}/unread`, this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<UnreadNotificationCount>) => resp.body?.count || 0),
        catchError(() => of(0))
      );
  }

  /**
   * Get all notifications
   */
  getAllNotifications(): Observable<Notification[]> {
    return this.http
      .get<Notification[]>(this.baseUrl, this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<Notification[]>) => {
          const notifications = resp.body || [];
          this.notifications.set(notifications);
          return notifications;
        }),
        catchError((err) => {
          console.error('Error loading notifications:', err);
          return of([]);
        })
      );
  }

  /**
   * Mark notification as read
   * @param notificationId ID of the notification to mark as read
   */
  markAsRead(notificationId: number): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/${notificationId}/read`, {}, this.getHttpOptions())
      .pipe(
        map(() => {
          // Update local state
          this.notifications.update((notifications) =>
            notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            )
          );
          this.loadUnreadCount();
        }),
        catchError((err) => {
          console.error('Error marking notification as read:', err);
          throw err;
        })
      );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/read-all`, {}, this.getHttpOptions())
      .pipe(
        map(() => {
          this.notifications.update((notifications) =>
            notifications.map((n) => ({ ...n, read: true }))
          );
          this.unreadCount.set(0);
        }),
        catchError((err) => {
          console.error('Error marking all as read:', err);
          throw err;
        })
      );
  }
}
