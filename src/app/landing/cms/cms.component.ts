// product-detail.component.ts
import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartzillaService } from '../../../themes/cartzilla/services/cartzilla.service';

// Import Cartzilla components
import { CartzillaHeaderComponent } from '../../../themes/cartzilla/components/header/header.component';
import { CartzillaCategoriesComponent } from '../../../themes/cartzilla/components/categories/categories.component';
import { CartzillaFooterComponent } from '../../../themes/cartzilla/components/footer/footer.component';

// Import product-detail-specific components

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CartzillaHeaderComponent,
    CartzillaCategoriesComponent,
    CartzillaFooterComponent,
    
  ],
  templateUrl: './cms.component.html',
})
export class CmsComponent implements OnInit, AfterViewInit, OnDestroy {
  
  private themeLink?: HTMLLinkElement;
  private iconLink?: HTMLLinkElement;
  private swiperLink?: HTMLLinkElement;
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
}