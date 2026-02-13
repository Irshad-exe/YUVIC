import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Category } from '../../../../app/siteadmin/categories/allcategories/category.model';
import { environment } from '../../../../environments/environment';
import { CartService } from '../../../../app/landing/cart/cart.service';

import { AuthService } from '../../../../app/core/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private readonly apiUrl = environment.authApiBaseUrl;

  private cartSubject = new BehaviorSubject<any>(this.getEmptyCart());
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private userSubject = new BehaviorSubject<any>(this.getDefaultUser());

  cart$ = this.cartSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.loadInitialData();
  }

  // Load all initial data for header
  private loadInitialData(): void {
    this.loadCategories();
    this.loadCart();
    this.loadUser();
  }

  // ... (categories and cart methods remain the same) ...

  loadCategories(): void {
    this.http.get<any>(`${environment.apiGatewayBaseUrl}/api/categories`).subscribe({
      next: (res) => {
        if (res.success) {
          this.categoriesSubject.next(res.data);
        }
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  getCategoriesForDropdown(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories/dropdown`);
  }

  loadCart(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cartSubject.next(cart);
    });
  }

  updateCartItemQuantity(itemId: string, quantity: number): void {
    const cart = this.cartService.getCartValue();
    const item = cart.items.find(i => i.id === itemId);
    if (item) {
      this.cartService.updateQuantity(item.product_id, quantity);
    }
  }

  removeCartItem(itemId: string): void {
    const cart = this.cartService.getCartValue();
    const item = cart.items.find(i => i.id === itemId);
    if (item) {
      this.cartService.removeFromCart(item.product_id);
    }
  }

  // User API calls
  loadUser(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userSubject.next({
          id: user.id || '',
          name: user.name || 'User',
          email: user.email || '',
          is_logged_in: true
        });
      } else {
        // Check if token exists in localStorage (auto-login scenario)
        const tokenUser = this.authService.getDecodeToken();
        if (tokenUser) {
          this.userSubject.next({
            id: tokenUser.id,
            name: tokenUser.name || tokenUser.username,
            email: tokenUser.email,
            is_logged_in: true
          });
        } else {
          this.userSubject.next(this.getDefaultUser());
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.userSubject.next(this.getDefaultUser());
    window.location.reload(); // Simple reload to clear state and redirect if needed
  }

  getDeliveryAddresses(): Observable<any> {
    // Mock addresses - likely user specific, could filter by user id if available in params
    const mockAddresses = {
      success: true,
      data: [
        {
          id: '1',
          address_line: '567 Cherry Lane Apt B12',
          city: 'Sacramento',
          state: 'CA',
          postal_code: '95829',
          country: 'USA',
          is_default: true
        },
        {
          id: '2',
          address_line: '1901 Thornridge Cir.',
          city: 'Shiloh',
          state: 'Hawaii',
          postal_code: '81063',
          country: 'USA',
          is_default: false
        }
      ]
    };
    return new Observable(observer => observer.next(mockAddresses));
  }

  getEmptyCart(): any {
    return {
      items: [],
      subtotal: 0,
      total_items: 0,
      delivery_fee: 0,
      total: 0,
      free_delivery_threshold: 50
    };
  }

  getDefaultUser(): any {
    return {
      id: '',
      name: '',
      email: '',
      is_logged_in: false
    };
  }
}