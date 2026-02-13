import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartzillaService {
  
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  initializeCartzilla(): void {
    if (!isPlatformBrowser(this.platformId) || this.initialized) {
      return;
    }

    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      this.initializeComponentsSafely();
      this.initialized = true;
    }, 1000);
  }

  private initializeComponentsSafely(): void {
    try {
      this.initializeBootstrap();
      this.initializeSwiper();
      this.initializeCustomComponents();
      console.log('Cartzilla components initialized');
    } catch (error) {
      console.error('Component initialization error:', error);
    }
  }

  private initializeBootstrap(): void {
    const bootstrap = (window as any).bootstrap;
    if (!bootstrap) {
      console.warn('Bootstrap not found');
      return;
    }

    // Safe initialization with try-catch for each component type
    const initializers = [
      { selector: '[data-bs-toggle="tooltip"]', factory: (el: Element) => new bootstrap.Tooltip(el) },
      { selector: '.dropdown-toggle', factory: (el: Element) => new bootstrap.Dropdown(el) },
      { selector: '.offcanvas', factory: (el: Element) => new bootstrap.Offcanvas(el) },
      { selector: '.collapse', factory: (el: Element) => new bootstrap.Collapse(el, { toggle: false }) }
    ];

    initializers.forEach(({ selector, factory }) => {
      try {
        document.querySelectorAll(selector).forEach(element => {
          if (element && element.nodeType === Node.ELEMENT_NODE) {
            factory(element);
          }
        });
      } catch (error) {
        console.warn(`Failed to initialize ${selector}:`, error);
      }
    });
  }

  private initializeSwiper(): void {
    const Swiper = (window as any).Swiper;
    if (!Swiper) {
      console.warn('Swiper not found');
      return;
    }

    try {
      document.querySelectorAll('[data-swiper]').forEach(element => {
        if (element && element.nodeType === Node.ELEMENT_NODE) {
          try {
            const config = element.getAttribute('data-swiper');
            const options = config ? JSON.parse(config) : {};
            new Swiper(element, options);
          } catch (error) {
            console.error('Swiper config error:', error);
          }
        }
      });
    } catch (error) {
      console.error('Swiper initialization error:', error);
    }
  }

  private initializeCustomComponents(): void {
    // Initialize sticky header
    this.initializeStickyHeader();
    
    // Initialize count inputs
    this.initializeCountInputs();
  }

  private initializeStickyHeader(): void {
    const stickyElement = document.querySelector('[data-sticky-element]');
    if (!stickyElement) return;

    const handleScroll = () => {
      if (window.scrollY > 100) {
        stickyElement.classList.add('navbar-stuck');
      } else {
        stickyElement.classList.remove('navbar-stuck');
      }
    };

    window.addEventListener('scroll', handleScroll);
  }

  private initializeCountInputs(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const incrementBtn = target.closest('[data-increment]');
      const decrementBtn = target.closest('[data-decrement]');

      if (incrementBtn || decrementBtn) {
        const countInput = incrementBtn?.closest('.count-input') || decrementBtn?.closest('.count-input');
        const input = countInput?.querySelector('input') as HTMLInputElement;
        
        if (input) {
          if (incrementBtn) {
            input.stepUp();
          } else if (decrementBtn) {
            input.stepDown();
          }
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  }
}