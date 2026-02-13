import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ProductDetailResponse {
  success: boolean;
  data: any;
  message?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  compare_price?: number;
  originalPrice?: number; // Add this
  description: string;
  ingredients: string;
  calories: string;
  delivery_info: string;
  weight: string;
  category: string;
  category_id?: number;
  images: any[];
  image?: string; // Add this for single image
  features: string[];
  stock: number;
  sku?: string;
  brand?: string;
  discount?: boolean; // Add this
  discountAmount?: string; // Add this
}
export interface RelatedProductsResponse {
  success: boolean;
  data: any[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductDetailService {
  private readonly apiUrl = environment.authApiBaseUrl;

  constructor(private httpClient: HttpClient) { }

  /** GET: Fetch product by ID */
  getProductById(productId: string): Observable<ProductDetailResponse> {
    return this.httpClient.get<ProductDetailResponse>(`${this.apiUrl}/products/${productId}`).pipe(
      catchError(this.handleError)
    );
  }

  /** GET: Fetch related products */
  getRelatedProducts(productId: string, categoryId?: number): Observable<RelatedProductsResponse> {
    let url = `${this.apiUrl}/products/related/${productId}`;
    if (categoryId) {
      url += `?category_id=${categoryId}`;
    }
    return this.httpClient.get<RelatedProductsResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}