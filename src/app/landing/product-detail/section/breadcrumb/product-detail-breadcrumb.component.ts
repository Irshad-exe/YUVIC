import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-detail-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="container position-relative z-2 pt-lg-2 mt-3 mt-lg-4" aria-label="breadcrumb">
      <ol class="breadcrumb mb-0">
        <li class="breadcrumb-item"><a routerLink="/home">Home</a></li>
        <li class="breadcrumb-item"><a routerLink="/catalog">Catalog</a></li>
        <li *ngIf="category" class="breadcrumb-item">
          <a [routerLink]="['/catalog']" [queryParams]="{category: categoryId}">{{category}}</a>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          {{productName || 'Product page'}}
        </li>
      </ol>
    </nav>
  `
})
export class ProductDetailBreadcrumbComponent {
  @Input() productName: string = '';
  @Input() category: string = '';
  @Input() categoryId: number | null = null;
}