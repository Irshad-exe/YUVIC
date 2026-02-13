import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cartzilla-featured-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './featured-categories.component.html',
  
})
export class CartzillaFeaturedCategoriesComponent {
  featuredCategories = [
    {
      title: 'Only fresh fish to your table',
      count: 124,
      image: 'assets/cartzilla/img/home/grocery/featured/01.png',
      link: '/shop',
      color: 'primary'
    },
    {
      title: 'Products for Easter table',
      count: 97,
      image: 'assets/cartzilla/img/home/grocery/featured/02.png',
      link: '/shop',
      color: 'success'
    },
    {
      title: 'Berries from the garden',
      count: 28,
      image: 'assets/cartzilla/img/home/grocery/featured/03.png',
      link: '/shop',
      color: 'info'
    }
  ];
}