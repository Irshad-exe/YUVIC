import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../product-detail.service';
import { WishlistService } from '../../../customer/wishlist/wishlist.service';

@Component({
  selector: 'app-product-detail-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail-info.component.html'
})
export class ProductDetailInfoComponent {
  @Input() product: Product | null = null;
  @Output() addToCartEvent = new EventEmitter<{ product: Product, quantity: number }>();

  // Inject WishlistService
  constructor(private wishlistService: WishlistService) { }

  quantity = 1;

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.addToCartEvent.emit({
        product: this.product,
        quantity: this.quantity
      });
    }
  }

  addToWishlist(): void {
    if (this.product) {
      this.wishlistService.addToWishlist(String(this.product.id));
    }
  }

  hasDiscount(): boolean {
    return !!(this.product?.compare_price && this.product.compare_price > this.product.price);
  }

  getDiscountPercentage(): number {
    if (!this.product?.compare_price || !this.hasDiscount()) return 0;
    return Math.round(((this.product.compare_price - this.product.price) / this.product.compare_price) * 100);
  }
}