import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../../../../app/siteadmin/product/allproduct/product.model';
import { Category } from '../../../../app/siteadmin/categories/allcategories/category.model';
import { environment } from '../../../../environments/environment';

// Interface for frontend product (matches your component)
export interface FrontendProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  weight: string;
  discount?: number;
  isFavorite: boolean;
  quantity: number;
  category_name?: string;
}

// Interface for frontend category (matches your component)
export interface FrontendCategory {
  id: number;
  name: string;
  image: string;
  count: number;
  link: string;
}

// Interface for special product (matches your special products component)
export interface SpecialProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  weight: string;
  isFavorite: boolean;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = environment.authApiBaseUrl;
  
  private popularProductsSubject = new BehaviorSubject<FrontendProduct[]>([]);
  private productCategoriesSubject = new BehaviorSubject<FrontendCategory[]>([]);
  private specialProductsSubject = new BehaviorSubject<SpecialProduct[]>([]);

  popularProducts$ = this.popularProductsSubject.asObservable();
  productCategories$ = this.productCategoriesSubject.asObservable();
  specialProducts$ = this.specialProductsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loadPopularProducts();
    this.loadProductCategories();
    this.loadSpecialProducts();
  }

  // Load popular products
  loadPopularProducts(): void {
    this.http.get<{success: boolean, data: FrontendProduct[]}>(`${this.apiUrl}/popular`).subscribe({
      next: (res) => {
        if (res.success) {
          this.popularProductsSubject.next(res.data);
        } else {
          console.error('Failed to load popular products');
        }
      },
      error: (err) => {
        console.error('Error loading popular products:', err);
        this.popularProductsSubject.next([]);
      }
    });
  }

  // Load product categories with counts
  loadProductCategories(): void {
    this.http.get<{success: boolean, data: FrontendCategory[]}>(`${this.apiUrl}/with-counts`).subscribe({
      next: (res) => {
        if (res.success) {
          this.productCategoriesSubject.next(res.data);
        } else {
          console.error('Failed to load product categories');
        }
      },
      error: (err) => {
        console.error('Error loading product categories:', err);
        this.productCategoriesSubject.next([]);
      }
    });
  }

  // Load special products
  loadSpecialProducts(): void {
    this.http.get<{success: boolean, data: SpecialProduct[]}>(`${this.apiUrl}/special`).subscribe({
      next: (res) => {
        if (res.success) {
          this.specialProductsSubject.next(res.data);
        } else {
          console.error('Failed to load special products');
        }
      },
      error: (err) => {
        console.error('Error loading special products:', err);
        this.specialProductsSubject.next([]);
      }
    });
  }

  // Refresh all data sources
  refreshData(): void {
    this.loadPopularProducts();
    this.loadProductCategories();
    this.loadSpecialProducts();
  }

  // Refresh only special products
  refreshSpecialProducts(): void {
    this.loadSpecialProducts();
  }

  // Toggle favorite status
  toggleFavorite(productId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products/${productId}/favorite`, {});
  }

  // Add to cart
  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cart/add`, {
      product_id: productId,
      quantity: quantity
    });
  }

  // Update cart quantity
  updateCartQuantity(productId: number, quantity: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cart/update`, {
      product_id: productId,
      quantity: quantity
    });
  }
}