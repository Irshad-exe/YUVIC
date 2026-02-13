import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cartzilla-lifestyle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lifestyle.component.html',
  styleUrls: ['./lifestyle.component.scss']
})
export class CartzillaLifestyleComponent {
  lifestyles = [
    {
      title: 'Gluten-Free',
      description: 'Foods that don\'t contain gluten',
      icon: 'ci-heart',
      color: 'warning',
      link: '/shop'
    },
    {
      title: 'Vegan',
      description: 'Vegetable based goodness',
      icon: 'ci-leaf',
      color: 'success',
      link: '/shop'
    },
    {
      title: 'Plant based',
      description: 'Based on herbal ingredients',
      icon: 'ci-apple',
      color: 'info',
      link: '/shop'
    },
    {
      title: 'Keto',
      description: 'Good fats served in food',
      icon: 'ci-fire',
      color: 'danger',
      link: '/shop'
    }
  ];
}