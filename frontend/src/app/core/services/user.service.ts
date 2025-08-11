import { Injectable, signal } from '@angular/core';
import { UserRole, UserProfile } from '../models/user.model';

// interface UserProfile {
//   id: number;
//   name: string;
//   role: UserRole | null;
//   email: string;
// }

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly currentUser = signal<UserProfile | null>(null);

  constructor() {}

  setCurrentUser(user: UserProfile): void {
    this.currentUser.set(user);
  }

  clearCurrentUser(): void {
    this.currentUser.set(null);
  }
}
