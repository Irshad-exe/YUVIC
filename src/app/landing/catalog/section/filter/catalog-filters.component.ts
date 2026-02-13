import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Add this import
import { CatalogFiltersService, CategoryResponse, Brand } from './catalog-filters.service';

interface Category {
  id: number;
  name: string;
  image_url?: string;
  children?: Category[];
}

@Component({
  selector: 'app-catalog-filters',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Add FormsModule here
  templateUrl: './catalog-filters.component.html'
})
export class CatalogFiltersComponent implements OnInit {
  
  @Input() categoryId: string | null = null;
  @Output() filtersChanged = new EventEmitter<any>();
  
  categories: Category[] = [];
  brands: Brand[] = [];
  priceRange = { min: 0, max: 100 };
  selectedPriceRange = { min: 0, max: 100 };
  selectedBrands: string[] = [];
  selectedDiets: string[] = [];
  selectedStatus: string[] = [];
  
  loading = false;

  constructor(private catalogFiltersService: CatalogFiltersService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
  }

  // Method to create safe IDs for HTML elements
  createSafeId(name: string): string {
    return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  }

  loadCategories(): void {
    this.loading = true;
    this.catalogFiltersService.getCategories()
      .subscribe({
        next: (response: CategoryResponse) => {
          if (response.success) {
            this.categories = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.loading = false;
        }
      });
  }

  loadBrands(): void {
    // Using the service to fetch brands from API
    this.catalogFiltersService.getBrands()
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.brands = response.data.map((brand: any) => ({
              id: brand.id.toString(),
              name: brand.name
            }));
          }
        },
        error: (error) => {
          console.error('Error loading brands:', error);
          // Fallback to static brands if API fails
          this.brands = this.getStaticBrands();
        }
      });
  }

  private getStaticBrands(): Brand[] {
    return [
      { id: 'coca-cola', name: 'Coca-Cola' },
      { id: 'pepsi', name: 'Pepsi' },
      { id: 'nestle', name: 'Nestlé' },
      { id: 'hersheys', name: 'Hershey\'s' },
      { id: 'general-mills', name: 'General Mills' },
      { id: 'barilla', name: 'Barilla' }
    ];
  }

  onPriceChange(): void {
    this.applyFilters();
  }

  onBrandChange(brand: string, event: any): void {
    if (event.target.checked) {
      this.selectedBrands.push(brand);
    } else {
      this.selectedBrands = this.selectedBrands.filter(b => b !== brand);
    }
    this.applyFilters();
  }

  onDietChange(diet: string, event: any): void {
    if (event.target.checked) {
      this.selectedDiets.push(diet);
    } else {
      this.selectedDiets = this.selectedDiets.filter(d => d !== diet);
    }
    this.applyFilters();
  }

  onStatusChange(status: string, event: any): void {
    if (event.target.checked) {
      this.selectedStatus.push(status);
    } else {
      this.selectedStatus = this.selectedStatus.filter(s => s !== status);
    }
    this.applyFilters();
  }

  applyFilters(): void {
    const filters = {
      priceRange: this.selectedPriceRange,
      brands: this.selectedBrands,
      diets: this.selectedDiets,
      status: this.selectedStatus
    };
    this.filtersChanged.emit(filters);
  }

  clearFilters(): void {
    this.selectedPriceRange = { ...this.priceRange };
    this.selectedBrands = [];
    this.selectedDiets = [];
    this.selectedStatus = [];
    this.applyFilters();
  }
}