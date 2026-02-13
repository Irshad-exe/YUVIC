import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CartzillaService } from '../../../themes/cartzilla/services/cartzilla.service';
import { ProductDetailService, Product } from './product-detail.service';
import { CartService } from '../cart/cart.service';

// Import Cartzilla components
import { CartzillaHeaderComponent } from '../../../themes/cartzilla/components/header/header.component';
import { CartzillaCategoriesComponent } from '../../../themes/cartzilla/components/categories/categories.component';
import { CartzillaFooterComponent } from '../../../themes/cartzilla/components/footer/footer.component';

// Import product-detail-specific components
import { ProductDetailBreadcrumbComponent } from './section/breadcrumb/product-detail-breadcrumb.component';
import { ProductDetailGalleryComponent } from './section/gallery/product-detail-gallery.component';
import { ProductDetailInfoComponent } from './section/info/product-detail-info.component';
import { ProductDetailRelatedComponent } from './section/related/product-detail-related.component';
import { ProductReviewsComponent } from './section/reviews/product-reviews.component'; // Import

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CartzillaHeaderComponent,
    CartzillaCategoriesComponent,
    CartzillaFooterComponent,
    ProductDetailBreadcrumbComponent,
    ProductDetailGalleryComponent,
    ProductDetailInfoComponent,
    ProductDetailRelatedComponent,
    ProductReviewsComponent // Add to imports
  ],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  private themeLink?: HTMLLinkElement;
  private iconLink?: HTMLLinkElement;
  private swiperLink?: HTMLLinkElement;
  private scriptsLoaded = false;

  productId: string = '';
  product: Product | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private cartzillaService: CartzillaService,
    private route: ActivatedRoute,
    private productDetailService: ProductDetailService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadCartzillaAssets();
    this.getProductIdFromRoute();
  }

  ngAfterViewInit(): void {
    this.initializeWhenReady();
  }

  ngOnDestroy(): void {
    this.removeDynamicAssets();
  }

  private getProductIdFromRoute(): void {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id') || '';
      if (this.productId) {
        this.loadProductData();
      } else {
        this.error = 'Product ID not found';
        this.loading = false;
      }
    });
  }

  private loadProductData(): void {
    this.loading = true;
    this.productDetailService.getProductById(this.productId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.product = this.formatProductData(response.data);
          } else {
            this.error = 'Failed to load product';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.error = 'Error loading product details';
          this.loading = false;
        }
      });
  }

  private formatProductData(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      compare_price: data.compare_price ? parseFloat(data.compare_price) : undefined,
      description: data.description || '',
      weight: data.weight ? `${data.weight}g` : '500g',
      category: data.category?.name || 'Uncategorized',
      category_id: data.category?.id,
      images: data.images || [],
      features: data.features || [],
      stock: data.stock || 0,
      sku: data.sku,
      brand: data.brand?.name,
      ingredients: data.ingredients,
      calories: data.calories,
      delivery_info: data.delivery_info
    };
  }

  private loadCartzillaAssets(): void {
    // Load CSS
    this.themeLink = document.createElement('link');
    this.themeLink.rel = 'stylesheet';
    this.themeLink.href = 'assets/cartzilla/css/theme.min.css';
    document.head.appendChild(this.themeLink);

    this.iconLink = document.createElement('link');
    this.iconLink.rel = 'stylesheet';
    this.iconLink.href = 'assets/cartzilla/icons/cartzilla-icons.min.css';
    document.head.appendChild(this.iconLink);

    this.swiperLink = document.createElement('link');
    this.swiperLink.rel = 'stylesheet';
    this.swiperLink.href = 'assets/cartzilla/vendor/swiper/swiper-bundle.min.css';
    document.head.appendChild(this.swiperLink);

    // Load JavaScript
    this.loadJavaScriptAssets().then(() => {
      this.scriptsLoaded = true;
      this.initializeCartzilla();
    });
  }

  private loadJavaScriptAssets(): Promise<void> {
    return new Promise((resolve) => {
      const scriptsToLoad = [
        'assets/cartzilla/js/theme.min.js',
        'assets/cartzilla/vendor/swiper/swiper-bundle.min.js',
        'assets/cartzilla/js/theme-switcher.js'
      ];

      this.loadScriptsSequentially(scriptsToLoad, resolve);
    });
  }

  private loadScriptsSequentially(scripts: string[], callback: () => void): void {
    let index = 0;

    const loadNextScript = () => {
      if (index >= scripts.length) {
        callback();
        return;
      }

      const script = document.createElement('script');
      script.src = scripts[index];
      script.onload = () => {
        index++;
        loadNextScript();
      };
      script.onerror = () => {
        console.error(`Failed to load script: ${scripts[index]}`);
        index++;
        loadNextScript();
      };
      document.head.appendChild(script);
    };

    loadNextScript();
  }

  private initializeWhenReady(): void {
    const maxWaitTime = 5000;
    const startTime = Date.now();

    const checkAndInitialize = () => {
      if (this.scriptsLoaded) {
        this.initializeCartzilla();
        return;
      }

      if (Date.now() - startTime < maxWaitTime) {
        setTimeout(checkAndInitialize, 100);
      } else {
        console.warn('Scripts loading timeout, initializing anyway');
        this.initializeCartzilla();
      }
    };

    checkAndInitialize();
  }

  private initializeCartzilla(): void {
    setTimeout(() => {
      this.cartzillaService.initializeCartzilla();
    }, 300);
  }

  private removeDynamicAssets(): void {
    [this.themeLink, this.iconLink, this.swiperLink].forEach(asset => {
      if (asset && asset.parentNode) {
        asset.parentNode.removeChild(asset);
      }
    });

    const dynamicScripts = document.querySelectorAll('script[src*="cartzilla"]');
    dynamicScripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
  }

  addToCart(event: { product: Product, quantity: number }): void {
    console.log('Adding to cart:', event.product.name, 'Quantity:', event.quantity);
    this.cartService.addToCart(event.product, event.quantity);
  }
}