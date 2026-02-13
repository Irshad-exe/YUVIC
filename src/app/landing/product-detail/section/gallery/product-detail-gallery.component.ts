import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail-gallery.component.html'
})
export class ProductDetailGalleryComponent implements OnChanges {
  @Input() images: any[] = [];
  @Input() productId: string = ''; // Add productId input
  
  selectedImage: string = 'assets/cartzilla/img/shop/grocery/product/01.png';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'] && this.images.length > 0) {
      this.selectedImage = this.getImageUrl(this.images[0]);
    }
  }

  selectImage(image: any): void {
    this.selectedImage = this.getImageUrl(image);
  }

  getImageUrls(): string[] {
    if (this.images.length === 0) {
      return ['assets/cartzilla/img/shop/grocery/product/01.png'];
    }
    return this.images.map(image => this.getImageUrl(image));
  }

  private getImageUrl(image: any): string {
    if (typeof image === 'string') {
      return image;
    }
    return 'assets/uploads/products/'+image.filename || image.url || 'assets/cartzilla/img/shop/grocery/product/01.png';
  }
}