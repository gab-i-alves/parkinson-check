import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  setCurrentUser(user: User | null): void {
    const roleMap: { [key: number]: 'paciente' | 'medico' | 'admin' } = {
      1: 'paciente',
      2: 'medico',
      3: 'admin',
    };
    
    if (user) {
      const mappedUser = { ...user, role: roleMap[user.role as any] };
      this.currentUserSubject.next(mappedUser);
    } else {
      this.currentUserSubject.next(null);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}