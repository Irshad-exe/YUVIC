import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private readonly apiUrl = environment.authApiBaseUrl;

  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch all coupons */
  getAllCoupons(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/coupons`);
  }

  /** GET: Fetch coupon by ID */
  getCouponById(id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/coupons/${id}`);
  }

  /** POST: Add a new coupon */
  addCoupon(coupon: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/coupons`, coupon);
  }

  /** PUT: Update an existing coupon */
  updateCoupon(couponData: any): Observable<any> {
    return this.httpClient.put<any>(`${this.apiUrl}/coupons/${couponData.id}`, couponData);
  }

  /** DELETE: Remove coupons by IDs */
  deleteCoupons(ids: number[]): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/coupons/bulk-delete`, { ids });
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}