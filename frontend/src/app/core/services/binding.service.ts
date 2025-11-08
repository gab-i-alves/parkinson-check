import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BindingRequestResponse } from '../models/binding-request.model';

@Injectable({
  providedIn: 'root',
})
export class BindingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/bindings`;

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
   * Get pending binding requests (unified for both doctor and patient)
   * Returns requests where the current user needs to take action
   */
  getPendingBindingRequests(): Observable<BindingRequestResponse[]> {
    return this.http
      .get<BindingRequestResponse[]>(`${this.baseUrl}/requests`, this.getHttpOptions())
      .pipe(
        map((resp: HttpResponse<BindingRequestResponse[]>) => resp.body || []),
        catchError((err) => throwError(() => err))
      );
  }

  /**
   * Request binding with another user
   * @param userId ID of the user to bind with (doctor or patient)
   */
  requestBinding(userId: number): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}/request`,
        { user_id: userId },
        this.getHttpOptions()
      )
      .pipe(
        map((resp: HttpResponse<any>) => resp.body),
        catchError((err) => throwError(() => err))
      );
  }

  /**
   * Accept a binding request
   * @param bindingId ID of the binding request to accept
   */
  acceptBindingRequest(bindingId: number): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}/${bindingId}/accept`,
        {},
        this.getHttpOptions()
      )
      .pipe(
        map((resp: HttpResponse<any>) => resp.body),
        catchError((err) => throwError(() => err))
      );
  }

  /**
   * Reject a binding request
   * @param bindingId ID of the binding request to reject
   */
  rejectBindingRequest(bindingId: number): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}/${bindingId}/reject`,
        {},
        this.getHttpOptions()
      )
      .pipe(
        map((resp: HttpResponse<any>) => resp.body),
        catchError((err) => throwError(() => err))
      );
  }

  /**
   * Unlink an active binding
   * @param bindingId ID of the binding to remove
   */
  unlinkBinding(bindingId: number): Observable<any> {
    return this.http
      .delete(
        `${this.baseUrl}/${bindingId}`,
        this.getHttpOptions()
      )
      .pipe(
        map((resp: HttpResponse<any>) => resp.body),
        catchError((err) => throwError(() => err))
      );
  }
}
