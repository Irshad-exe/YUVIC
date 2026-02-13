import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CartzillaService } from '../../../themes/cartzilla/services/cartzilla.service';
import { HttpClient } from '@angular/common/http';

// Import Cartzilla components
import { CartzillaHeaderComponent } from '../../../themes/cartzilla/components/header/header.component';
import { CartzillaCategoriesComponent } from '../../../themes/cartzilla/components/categories/categories.component';
import { CartzillaFooterComponent } from '../../../themes/cartzilla/components/footer/footer.component';

// Import catalog-specific components
import { CatalogBreadcrumbComponent } from './section/breadcrumb/catalog-breadcrumb.component';
import { CatalogFiltersComponent } from './section/filter/catalog-filters.component';
import { CatalogProductsComponent } from './section/product/catalog-products.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CartzillaHeaderComponent,
    CartzillaCategoriesComponent,
    CartzillaFooterComponent,
    CatalogBreadcrumbComponent,
    CatalogFiltersComponent,
    CatalogProductsComponent
  ],
  templateUrl: './catalog.component.html',
})
export class CatalogComponent implements OnInit, AfterViewInit, OnDestroy {
  
  private themeLink?: HTMLLinkElement;
  private iconLink?: HTMLLinkElement;
  private simplebarLink?: HTMLLinkElement;
  private choicesLink?: HTMLLinkElement;
  private nouisliderLink?: HTMLLinkElement;
  private scriptsLoaded = false;
  categoryId: string | null = null;
  searchQuery: string | null = null;
  categoryName: string = 'Shop catalog';

  constructor(
    private cartzillaService: CartzillaService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCartzillaAssets();
    this.getCategoryFromRoute();
  }

  private getCategoryFromRoute(): void {
    this.route.paramMap.subscribe(params => {
      this.categoryId = params.get('id');
      this.updatePageTitle();
    });
    
    this.route.queryParamMap.subscribe(queryParams => {
      this.searchQuery = queryParams.get('search');
      if (this.searchQuery) {
        this.categoryName = `Search results for "${this.searchQuery}"`;
      }
    });
  }

  private updatePageTitle(): void {
    if (this.categoryId) {
      // Fetch category name from API
      this.http.get<any>(`http://localhost:3000/api/categories/${this.categoryId}`)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.categoryName = response.data.name;
            }
          },
          error: (error) => {
            console.error('Error fetching category:', error);
            this.categoryName = 'Category Products';
          }
        });
    } else {
      this.categoryName = 'Shop catalog';
    }
  }

  ngAfterViewInit(): void {
    this.initializeWhenReady();
  }

  ngOnDestroy(): void {
    this.removeDynamicAssets();
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

    this.simplebarLink = document.createElement('link');
    this.simplebarLink.rel = 'stylesheet';
    this.simplebarLink.href = 'assets/cartzilla/vendor/simplebar/dist/simplebar.min.css';
    document.head.appendChild(this.simplebarLink);

    this.choicesLink = document.createElement('link');
    this.choicesLink.rel = 'stylesheet';
    this.choicesLink.href = 'assets/cartzilla/vendor/choices.js/public/assets/styles/choices.min.css';
    document.head.appendChild(this.choicesLink);

    this.nouisliderLink = document.createElement('link');
    this.nouisliderLink.rel = 'stylesheet';
    this.nouisliderLink.href = 'assets/cartzilla/vendor/nouislider/dist/nouislider.min.css';
    document.head.appendChild(this.nouisliderLink);

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
        'assets/cartzilla/vendor/simplebar/dist/simplebar.min.js',
        'assets/cartzilla/js/theme-switcher.js',
        'assets/cartzilla/vendor/choices.js/public/assets/scripts/choices.min.js',
        'assets/cartzilla/vendor/nouislider/dist/nouislider.min.js',
        'assets/cartzilla/vendor/list.js/dist/list.min.js'
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
    [this.themeLink, this.iconLink, this.simplebarLink, this.choicesLink, this.nouisliderLink].forEach(asset => {
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
}