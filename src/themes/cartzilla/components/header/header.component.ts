import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HeaderService } from './header.service';
import { Category } from '../../../../app/siteadmin/categories/allcategories/category.model';

@Component({
  selector: 'app-cartzilla-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class CartzillaHeaderComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  // Data from services
  categories: Category[] = [];
  cart: any = this.headerService.getEmptyCart();
  user: any = this.headerService.getDefaultUser();
  deliveryAddresses: any[] = [];

  // UI State
  isSearchCollapsed = true;
  activeDeliveryTab = 'delivery';
  selectedAddressId: string = '';
  selectedStoreId: string = '';

  constructor(private headerService: HeaderService, private router: Router) { }

  ngOnInit(): void {
    // Subscribe to categories
    this.subscriptions.add(
      this.headerService.categories$.subscribe(categories => {
        this.categories = categories;
      })
    );

    // Subscribe to cart
    this.subscriptions.add(
      this.headerService.cart$.subscribe(cart => {
        this.cart = cart;
      })
    );

    // Subscribe to user
    this.subscriptions.add(
      this.headerService.user$.subscribe(user => {
        this.user = user;
      })
    );

    // Load delivery addresses
    this.loadDeliveryAddresses();

    // Initialize theme
    this.initializeTheme();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleSearch(): void {
    this.isSearchCollapsed = !this.isSearchCollapsed;
  }

  // Cart methods
  updateQuantity(item: any, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      this.headerService.updateCartItemQuantity(item.id, newQuantity);
    }
  }

  removeItem(itemId: string): void {
    this.headerService.removeCartItem(itemId);
  }

  // Delivery methods
  loadDeliveryAddresses(): void {
    this.headerService.getDeliveryAddresses().subscribe({
      next: (res) => {
        if (res.success) {
          this.deliveryAddresses = res.data;
          const defaultAddress = res.data.find((addr: any) => addr.is_default);
          if (defaultAddress) {
            this.selectedAddressId = defaultAddress.id;
          }
        }
      },
      error: (err) => console.error('Error loading delivery addresses:', err)
    });
  }

  setActiveTab(tab: string): void {
    this.activeDeliveryTab = tab;
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId = addressId;
  }

  selectStore(storeId: string): void {
    this.selectedStoreId = storeId;
  }

  // Helper methods
  getCartItemTotal(item: any): number {
    return item.price * item.quantity - (item.discount || 0);
  }

  hasFreeDelivery(): boolean {
    return this.cart.subtotal >= this.cart.free_delivery_threshold;
  }

  getDeliveryMessage(): string {
    if (this.hasFreeDelivery()) {
      return `Congratulations 🎉 You have added more than $${this.cart.free_delivery_threshold} to your cart. Delivery is free for you!`;
    } else {
      const remaining = this.cart.free_delivery_threshold - this.cart.subtotal;
      return `Add $${remaining.toFixed(2)} more for free delivery!`;
    }
  }

  // Search method
  onSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/shop-category', 'all'], { queryParams: { search: query.trim() } });
      this.isSearchCollapsed = true;
    }
  }

  logout(): void {
    this.headerService.logout();
  }

  // Get parent categories (categories without parent_id)
  getParentCategories(): Category[] {
    return this.categories.filter(cat => !cat.parent_id);
  }

  // Get child categories for a parent
  getChildCategories(parentId: string): Category[] {
    return this.categories.filter(cat => cat.parent_id === parentId);
  }

  // Theme toggle
  initializeTheme(): void {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);
  }

  toggleTheme(): void {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
  }
}