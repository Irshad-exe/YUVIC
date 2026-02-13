import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = environment.authApiBaseUrl;

  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch all products */
 getDashboardStats(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/dashboard/stats`);
  }

 
  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}