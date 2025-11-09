import { Injectable, signal } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PaginatedUsers,
  User,
  UserFilters,
  UserRole,
} from '../../../core/models/user.model';

interface UserBackendResponse {
  id: number;
  name: string;
  cpf: string;
  email: string;
  user_type: UserRole;
  is_active: boolean;
  location: string;
  created_at: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface ChangeStatusData {
  is_active: boolean;
  reason?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private apiUrl = environment.apiUrl;
  private allUsers: User[] = [];

  readonly users = signal<User[]>([]);

  constructor(private http: HttpClient) {}

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

  private mapBackendUserToFrontend(backendUser: UserBackendResponse): User {
    return {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      cpf: backendUser.cpf,
      role: backendUser.user_type as 'paciente' | 'medico' | 'admin',
      status: backendUser.is_active,
      createdAt: backendUser.created_at,
      location: backendUser.location,
    };
  }

  private loadAllUsers(): Observable<User[]> {
    return this.http
      .get<UserBackendResponse[]>(
        `${environment.apiUrl}/admin/users`,
        this.getHttpOptions()
      )
      .pipe(
        map((resp: HttpResponse<UserBackendResponse[]>) => {
          if (resp.status === 200 && resp.body) {
            console.log(resp.body)
            return resp.body.map((p) => this.mapBackendUserToFrontend(p));
          }
          return [];
        }),
        catchError((err) => {
          console.error('Erro ao buscar usuários:', err);
          return throwError(() => err);
        })
      );
  }

  getUsersPage(
    page: number,
    pageSize: number,
    filters?: UserFilters
  ): Observable<PaginatedUsers> {
    return this.loadAllUsers().pipe(
      map((allUsers) => {
        this.allUsers = allUsers;
        let filteredUsers = [...allUsers];

        if (filters?.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          console.log(query)
          filteredUsers = filteredUsers.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.cpf?.includes(query) ||
              p.email?.includes(query) ||
              false
          );
        }

        if (filters?.status !== undefined) {
          filteredUsers = filteredUsers.filter(
            (u) => u.status === filters.status
          );
        }

        console.log(filters?.userType)
        if (filters?.userType) {
          filteredUsers = filteredUsers.filter(
            (u) => Number(u.role) === Number(filters.userType)
          );
        }

        const total = filteredUsers.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const users = filteredUsers.slice(startIndex, endIndex);

        const result: PaginatedUsers = {
          users,
          total,
          page,
          pageSize,
          totalPages,
        };

        return result;
      })
    );
  }

  getUserById(userId: number): Observable<any> {
    // UserDetail
    return this.http.get<any>(`${this.apiUrl}/admin/users/${userId}`);
  }

  createUser(userData: any): Observable<any> {
    // CreateUserData, User
    return this.http.post<any>(`${this.apiUrl}/admin/users`, userData);
  }

  updateUser(userId: number, userData: UpdateUserData): Observable<any> {
    // User
    return this.http.put<any>(`${this.apiUrl}/admin/users/${userId}`, userData);
  }

  changeUserStatus(userId: number, status: ChangeStatusData): Observable<any> {
    // User
    return this.http.patch<any>(
      `${this.apiUrl}/admin/users/${userId}/status`,
      status
    );
  }
}
