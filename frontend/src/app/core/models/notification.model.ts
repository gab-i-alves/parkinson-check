// Enum for notification types
export enum NotificationType {
  BIND_REQUEST = 'BIND_REQUEST',
  BIND_ACCEPTED = 'BIND_ACCEPTED',
  BIND_REJECTED = 'BIND_REJECTED',
  BIND_REVERSED = 'BIND_REVERSED'
}

// Notification interface
export interface Notification {
  id: number;
  message: string;
  read: boolean;
  type: NotificationType;
  bind_id: number;
  created_at: string; // ISO date string
}

// Unread notification count response
export interface UnreadNotificationCount {
  count: number;
}
