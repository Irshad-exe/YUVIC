import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, FrontendProduct, FrontendCategory } from './product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cartzilla-popular-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './popular-products.component.html',
  styleUrls: ['./popular-products.component.scss']
})
export class CartzillaPopularProductsComponent implements OnInit, OnDestroy {
  productCategories: FrontendCategory[] = [];
  popularProducts: FrontendProduct[] = [];

  private subscriptions = new Subscription();

  constructor(private productService: ProductService) {}

  ngOnInit() {
    // Subscribe to product categories
    this.subscriptions.add(
      this.productService.productCategories$.subscribe(categories => {
        this.productCategories = categories;
      })
    );

    // Subscribe to popular products
    this.subscriptions.add(
      this.productService.popularProducts$.subscribe(products => {
        this.popularProducts = products;
      })
    );

    // Refresh data on component initialization
    this.productService.refreshData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleFavorite(product: FrontendProduct) {
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

  incrementQuantity(product: FrontendProduct) {
    product.quantity++;
    // You can call the cart service here if needed
  }

  decrementQuantity(product: FrontendProduct) {
    if (product.quantity > 0) {
      product.quantity--;
      // You can call the cart service here if needed
    }
  }

  // Optional: Manual refresh method
  refreshData() {
    this.productService.refreshData();
  }
}