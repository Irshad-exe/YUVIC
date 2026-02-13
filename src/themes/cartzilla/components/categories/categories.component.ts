// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';

// @Component({
//   selector: 'app-cartzilla-categories',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './categories.component.html',
//   //styleUrls: ['./categories.component.scss']
// })
// export class CartzillaCategoriesComponent {
//   categories = [
//     { name: 'Weekly sale', icon: 'ci-percent', image: '', link: '/shop' },
//     { name: 'Vegetables', icon: '', image: 'assets/cartzilla/img/mega-menu/grocery/th01.png', link: '/shop-category' },
//     { name: 'Easter is coming', icon: '', image: 'assets/cartzilla/img/mega-menu/grocery/th02.png', link: '/shop-category' },
//     { name: 'Poultry meat', icon: '', image: 'assets/cartzilla/img/mega-menu/grocery/th03.png', link: '/shop-category' },
//     { name: 'Fresh fruits', icon: '', image: 'assets/cartzilla/img/mega-menu/grocery/th04.png', link: '/shop-category' },
//     { name: 'St. Patrick\'s day', icon: '', image: 'assets/cartzilla/img/mega-menu/grocery/th05.png', link: '/shop-category' },
//     { name: 'Exotic fruits', icon: '', image: 'assets/cartzilla/img/mega-menu/grocery/th06.png', link: '/shop-category' }
//   ];
// }


import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderService } from '../header/header.service';
import { Category } from '../../../../app/siteadmin/categories/allcategories/category.model';

@Component({
  selector: 'app-cartzilla-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.component.html',
})
export class CartzillaCategoriesComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  
  categories: Category[] = [];
  featuredCategories: any[] = [];

  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    // Subscribe to categories from header service
    this.subscriptions.add(
      this.headerService.categories$.subscribe((categories: Category[]) => {
        this.categories = categories;
        this.prepareFeaturedCategories();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private prepareFeaturedCategories(): void {
    // Get featured categories or first few categories
    const featuredCats = this.categories
      .filter(cat => cat.is_featured && cat.status)
      .slice(0, 7); // Limit to 7 featured categories

    // If not enough featured categories, add some regular ones
    if (featuredCats.length < 7) {
      const regularCats = this.categories
        .filter(cat => !cat.is_featured && cat.status && !featuredCats.some(fc => fc.id === cat.id))
        .slice(0, 7 - featuredCats.length);
      
      featuredCats.push(...regularCats);
    }

    // Map to the format needed for the template
    this.featuredCategories = featuredCats.map((category, index) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image_url: category.image_url || this.getDefaultImage(index),
      icon: category.image_url ? '' : 'ci-grid', // Use icon if no image
      //link: `/category/${category.slug}`
       link: `/shop-category/${category.id}`
    }));

    // Ensure we always have at least one category (Weekly sale)
    if (this.featuredCategories.length === 0) {
      this.featuredCategories = [this.getWeeklySaleCategory()];
    } else {
      // Add weekly sale as first item if we have categories
      this.featuredCategories.unshift(this.getWeeklySaleCategory());
    }
  }

  private getDefaultImage(index: number): string {
    const defaultImages = [
      'assets/cartzilla/img/mega-menu/grocery/th01.png',
      'assets/cartzilla/img/mega-menu/grocery/th02.png',
      'assets/cartzilla/img/mega-menu/grocery/th03.png',
      'assets/cartzilla/img/mega-menu/grocery/th04.png',
      'assets/cartzilla/img/mega-menu/grocery/th05.png',
      'assets/cartzilla/img/mega-menu/grocery/th06.png',
      'assets/cartzilla/img/mega-menu/grocery/th07.png'
    ];
    return defaultImages[index % defaultImages.length];
  }

  private getWeeklySaleCategory(): any {
    return {
      name: 'Combo',
      icon: 'ci-percent',
      image: '',
      link: '/shop-category',
      is_special: true
    };
  }

  // Get parent categories for navigation
  getParentCategories(): Category[] {
    return this.categories;
  }

  // Get child categories for a specific parent
  // getChildCategories(parentId: string): Category[] {
  //   return this.categories.filter(cat => cat.parent_id === parentId && cat.status);
  // }
}