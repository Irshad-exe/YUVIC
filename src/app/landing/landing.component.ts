import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartzillaService } from '../../themes/cartzilla/services/cartzilla.service';

// Import all Cartzilla components
import { CartzillaHeaderComponent } from '../../themes/cartzilla/components/header/header.component';
import { CartzillaCategoriesComponent } from '../../themes/cartzilla/components/categories/categories.component';
import { CartzillaHeroSliderComponent } from '../../themes/cartzilla/components/hero-slider/hero-slider.component';
import { CartzillaFeaturedCategoriesComponent } from '../../themes/cartzilla/components/featured-categories/featured-categories.component';
import { CartzillaPopularProductsComponent } from '../../themes/cartzilla/components/popular-products/popular-products.component';
import { CartzillaLifestyleComponent } from '../../themes/cartzilla/components/lifestyle/lifestyle.component';
import { CartzillaSpecialProductsComponent } from '../../themes/cartzilla/components/special-products/special-products.component';
import { CartzillaRecipesComponent } from '../../themes/cartzilla/components/recipes/recipes.component';
import { CartzillaCtaBannersComponent } from '../../themes/cartzilla/components/cta-banners/cta-banners.component';
import { CartzillaFooterComponent } from '../../themes/cartzilla/components/footer/footer.component';
// Import components...

@Component({
  selector: 'app-landing',
  standalone: true,
   imports: [
    CommonModule,
    RouterModule,
    CartzillaHeaderComponent,
    CartzillaCategoriesComponent,
    CartzillaHeroSliderComponent,
    CartzillaFeaturedCategoriesComponent,
    CartzillaPopularProductsComponent,
    CartzillaLifestyleComponent,
    CartzillaSpecialProductsComponent,
    CartzillaRecipesComponent,
    CartzillaCtaBannersComponent,
    CartzillaFooterComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  
  private themeLink?: HTMLLinkElement;
  private iconLink?: HTMLLinkElement;
  private swiperLink?: HTMLLinkElement;
  private simplebarLink?: HTMLLinkElement;
  private choicesLink?: HTMLLinkElement;
  private nouisliderLink?: HTMLLinkElement;
  private scriptsLoaded = false;

  constructor(private cartzillaService: CartzillaService) {}

  ngOnInit(): void {
    this.loadCartzillaAssets();
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
        'assets/cartzilla/vendor/swiper/swiper-bundle.min.js', 
        'assets/cartzilla/js/theme.min.js',
        'assets/cartzilla/js/theme-switcher.js',
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
      
      // Add error handler to catch script execution errors
      const originalOnError = window.onerror;
      window.onerror = (msg, url, lineNo, columnNo, error) => {
        if (url && url.includes('theme.min.js')) {
          console.warn('Cartzilla theme.min.js non-critical error suppressed');
          return true; // Suppress error
        }
        return originalOnError ? originalOnError(msg, url, lineNo, columnNo, error) : false;
      };
      
      script.onload = () => {
        window.onerror = originalOnError; // Restore original handler
        index++;
        loadNextScript();
      };
      script.onerror = () => {
        window.onerror = originalOnError; // Restore original handler
        console.error(`Failed to load script: ${scripts[index]}`);
        index++;
        loadNextScript();
      };
      document.head.appendChild(script);
    };

    loadNextScript();
  }

  private initializeWhenReady(): void {
    const maxWaitTime = 5000; // 5 seconds max
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
    // Wait for DOM to be fully ready
    setTimeout(() => {
      try {
        this.cartzillaService.initializeCartzilla();
      } catch (error) {
        // Suppress Cartzilla initialization errors for missing elements
        console.warn('Cartzilla initialization warning (non-critical):', error);
      }
    }, 300);
  }

  private removeDynamicAssets(): void {
    // Remove dynamically added styles and scripts
    [this.themeLink, this.iconLink].forEach(asset => {
      if (asset && asset.parentNode) {
        asset.parentNode.removeChild(asset);
      }
    });

    // Remove dynamically added scripts (optional)
    const dynamicScripts = document.querySelectorAll('script[src*="cartzilla"]');
    dynamicScripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
  }
}