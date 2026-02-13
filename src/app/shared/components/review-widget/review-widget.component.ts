
import { Component, Input } from '@angular/core';

interface Review {
  name: string;
  timeAgo: string;
  rating: number; // rating from 0 to 5
  comment: string;
  imageUrl: string;
}

@Component({
    selector: 'app-review-widget',
    imports: [],
    templateUrl: './review-widget.component.html',
    styleUrl: './review-widget.component.scss'
})
export class ReviewWidgetComponent {
  @Input() reviews: Review[] = [];

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return [
      ...Array(fullStars).fill('star'),
      ...Array(halfStars).fill('star_half'),
      ...Array(emptyStars).fill('star_border'),
    ];
  }
}
