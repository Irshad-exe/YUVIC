import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, SpecialProduct } from '../popular-products/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cartzilla-special-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './special-products.component.html',
  styleUrls: ['./special-products.component.scss']
})
export class CartzillaSpecialProductsComponent implements OnInit, OnDestroy {
  specialProducts: SpecialProduct[] = [];

  private subscriptions = new Subscription();

  constructor(private productService: ProductService) {}

  ngOnInit() {
    // Subscribe to special products
    this.subscriptions.add(
      this.productService.specialProducts$.subscribe(products => {
        this.specialProducts = products;
      })
    );

    // Load special products on component initialization
    this.productService.refreshSpecialProducts();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleFavorite(product: SpecialProduct) {
    product.isFavorite = !product.isFavorite;
    // You can also call the service to update on backend if needed
    this.productService.toggleFavorite(product.id).subscribe({
      next: (res) => {
        if (!res.success) {
          // Revert if API call fails
          product.isFavorite = !product.isFavorite;
        }
      },
      error: (err) => {
        console.error('Error toggling favorite:', err);
        // Revert on error
        product.isFavorite = !product.isFavorite;
      }
    });
  }

  incrementQuantity(product: SpecialProduct) {
    product.quantity++;
    // You can call the cart service here if needed
  }

  decrementQuantity(product: SpecialProduct) {
    if (product.quantity > 0) {
      product.quantity--;
      // You can call the cart service here if needed
    }
  }

  // Optional: Manual refresh method
  refreshSpecialProducts() {
    this.productService.refreshSpecialProducts();
  }
}