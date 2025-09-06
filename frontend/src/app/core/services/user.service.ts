import { Injectable, signal } from '@angular/core';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly currentUser = signal<UserProfile | null>(null);

  setCurrentUser(user: UserProfile): void {
    this.currentUser.set(user);
  }

  clearCurrentUser(): void {
    this.currentUser.set(null);
  }
}
