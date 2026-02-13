import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CatalogProductsService, ProductResponse } from './catalog-products.service';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  weight: string;
  discount?: boolean;
  discountAmount?: string;
  compare_price?: number;
  images?: any[];
  stock?: number;
}

@Component({
  selector: 'app-catalog-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './catalog-products.component.html'
})
export class CatalogProductsComponent implements OnInit, OnChanges {
  
  @Input() categoryId: string | null = null;
  @Input() searchQuery: string | null = null;
  
  products: Product[] = [];
  selectedFilters: string[] = [];
  totalProducts: number = 0;
  loading: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 12;
  sortBy: string = 'Relevance';

  constructor(private catalogProductsService: CatalogProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnChanges(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.itemsPerPage.toString());

    // Add sorting
    if (this.sortBy !== 'Relevance') {
      params = params.set('sort', this.getSortParam());
    }

    // Add search query if present
    if (this.searchQuery) {
      params = params.set('search', this.searchQuery);
    }

    // Use service to fetch products
    console.log("this.categoryId ",this.categoryId)
    const productsObservable = this.categoryId && this.categoryId !== 'all'
      ? this.catalogProductsService.getProductsByCategory(this.categoryId, params)
      : this.catalogProductsService.getProducts(params);

    productsObservable.subscribe({
      next: (response: ProductResponse) => {
        if (response.success) {
          this.products = this.formatProducts(response.data);
          this.totalProducts = response.total || response.data.length;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  private formatProducts(products: any[]): Product[] {
    return products.map(product => {
      // Calculate discount
      const hasDiscount = product.compare_price && product.compare_price > product.price;
      const discountPercentage = hasDiscount 
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0;

      // Get main image
      const mainImage = product.images && product.images.length > 0 
        ? 'assets/uploads/products/'+product.images[0].filename 
        : 'assets/cartzilla/img/shop/grocery/01.png';

      return {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        originalPrice: product.compare_price ? parseFloat(product.compare_price) : undefined,
        image: mainImage,
        weight: product.weight ? `${product.weight}g` : '500g',
        discount: hasDiscount,
        discountAmount: hasDiscount ? `-${discountPercentage}%` : undefined,
        stock: product.stock || 0
      };
    });
  }

  private getSortParam(): string {
    switch (this.sortBy) {
      case 'Price: Low to High': return 'price_asc';
      case 'Price: High to Low': return 'price_desc';
      case 'Newest Arrivals': return 'newest';
      case 'Popularity': return 'popular';
      default: return 'relevance';
    }
  }

  onSortChange(sortValue: string): void {
    this.sortBy = sortValue;
    this.currentPage = 1;
    this.loadProducts();
  }

  removeFilter(filter: string): void {
    this.selectedFilters = this.selectedFilters.filter(f => f !== filter);
    // Implement filter removal logic
    this.loadProducts();
  }

  clearAllFilters(): void {
    this.selectedFilters = [];
    this.loadProducts();
  }

  onPageChange(page: number | string): void {
    // Only change page if it's a number (not the '...' string)
    if (typeof page === 'number') {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  // Add to cart functionality
  addToCart(product: Product): void {
    // Implement add to cart logic
    console.log('Add to cart:', product);
  }

  // Add to wishlist functionality
  addToWishlist(product: Product): void {
    // Implement add to wishlist logic
    console.log('Add to wishlist:', product);
  }

  // Generate page numbers for pagination
  getPageNumbers(): (number | string)[] {
    const totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (this.currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(totalPages - 1, this.currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (this.currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  }

  // Check if page is a number (for template)
  isNumber(page: number | string): page is number {
    return typeof page === 'number';
  }
}