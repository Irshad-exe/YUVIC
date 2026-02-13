import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductDetailService, Product } from '../../product-detail.service';

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: any[];
  weight: string;
  discount?: boolean;
  discountAmount?: string;
  category?: string;
}

@Component({
  selector: 'app-product-detail-related',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail-related.component.html'
})
export class ProductDetailRelatedComponent implements OnInit {
  @Input() productId: string = '';
  @Input() categoryId?: number;

  relatedProducts: RelatedProduct[] = [];
  loading: boolean = true;

  constructor(private productDetailService: ProductDetailService) {}

  ngOnInit(): void {
    if (this.productId) {
      this.loadRelatedProducts();
    }
  }

  loadRelatedProducts(): void {
    this.loading = true;
    this.productDetailService.getRelatedProducts(this.productId, this.categoryId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.relatedProducts = response.data.map((product: any) => this.formatProduct(product));
          } else {
            // Fallback to static data if API fails or returns no data
            this.relatedProducts = this.getStaticRelatedProducts();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading related products:', error);
          // Fallback to static data
          this.relatedProducts = this.getStaticRelatedProducts();
          this.loading = false;
        }
      });
  }

  private formatProduct(data: any): RelatedProduct {
    const hasDiscount = data.compare_price && data.compare_price > data.price;
    const discountPercentage = hasDiscount 
      ? Math.round(((data.compare_price - data.price) / data.compare_price) * 100)
      : 0;

    // Get main image
    const mainImage = data.images && data.images.length > 0 
      ? this.getImageUrl(data.images[0])
      : data.image || 'assets/cartzilla/img/shop/grocery/02.png';

    return {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      originalPrice: data.compare_price ? parseFloat(data.compare_price) : undefined,
      image: mainImage,
      weight: data.weight ? `${data.weight}g` : '500g',
      discount: hasDiscount,
      discountAmount: hasDiscount ? `-${discountPercentage}%` : undefined,
      category: data.category?.name || 'Uncategorized'
    };
  }

  private getImageUrl(image: any): string {
    if (typeof image === 'string') {
      return image;
    }
    return image.path || image.url || 'assets/cartzilla/img/shop/grocery/02.png';
  }

  private getStaticRelatedProducts(): RelatedProduct[] {
    return [
      {
        id: 2,
        name: 'Fresh orange Klementina, Spain',
        price: 3.12,
        originalPrice: 4.05,
        image: 'assets/cartzilla/img/shop/grocery/02.png',
        weight: '1kg',
        discount: true,
        discountAmount: '-30%'
      },
      {
        id: 3,
        name: 'Pepsi soda classic, can',
        price: 0.80,
        image: 'assets/cartzilla/img/shop/grocery/03.png',
        weight: '330ml'
      },
      {
        id: 4,
        name: 'Mozzarella mini cheese Granaloro',
        price: 2.99,
        image: 'assets/cartzilla/img/shop/grocery/04.png',
        weight: '250g'
      },
      {
        id: 5,
        name: 'Coconut, Indonesia',
        price: 1.24,
        image: 'assets/cartzilla/img/shop/grocery/05.png',
        weight: '1 coconut'
      }
    ];
  }

  addToCart(product: RelatedProduct): void {
    console.log('Added related product to cart:', product);
  }
}