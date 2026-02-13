import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from './wishlist.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container py-5">
      <h2 class="mb-4">My Wishlist</h2>
      <div class="row g-4" *ngIf="items.length > 0; else emptyState">
        <div class="col-sm-6 col-lg-4 col-xl-3" *ngFor="let item of items">
            <div class="card h-100 product-card">
                 <!-- Product Image & Link -->
                 <div class="position-relative">
                    <button class="btn btn-icon btn-sm btn-danger position-absolute top-0 end-0 z-2 mt-2 me-2 rounded-circle" 
                        (click)="removeItem(item.id)" title="Remove">
                        <i class="ci-trash"></i>
                    </button>
                    <a [routerLink]="['/product', item.product?.id]"> 
                        <img [src]="getProductImage(item.product)" class="card-img-top" alt="Product">
                    </a>
                 </div>
                 <div class="card-body">
                    <h3 class="h6 mb-2 fs-base">
                        <a [routerLink]="['/product', item.product?.id]" class="nav-link">{{ item.product?.name }}</a>
                    </h3>
                    <div class="text-primary fw-medium">{{ item.product?.price | currency }}</div>
                 </div>
            </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="text-center py-5">
            <i class="ci-heart fs-1 text-muted mb-3"></i>
            <p class="h5">Your wishlist is empty</p>
            <a routerLink="/catalog" class="btn btn-primary mt-3">Start Shopping</a>
        </div>
      </ng-template>
    </div>
  `
})
export class WishlistComponent implements OnInit {
    items: any[] = [];

    constructor(private wishlistService: WishlistService) { }

    ngOnInit(): void {
        this.wishlistService.wishlist$.subscribe(items => {
            this.items = items;
        });
    }

    removeItem(id: string): void {
        this.wishlistService.removeFromWishlist(id);
    }

    getProductImage(product: any): string {
        if (!product) return 'assets/cartzilla/img/shop/grocery/01.png';
        
        if (product.images && product.images.length > 0) {
            const filename = product.images[0].filename;
            return `http://localhost:5000/uploads/products/${filename}`;
        }
        
        return 'assets/cartzilla/img/shop/grocery/01.png';
    }
} 
