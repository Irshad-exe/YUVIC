import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SliderService, Slider } from './slider.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cartzilla-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './hero-slider.component.html',
  providers: [SliderService]
})
export class CartzillaHeroSliderComponent implements OnInit, OnDestroy {
  slides: any[] = [];
  private subscription: Subscription = new Subscription();
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private sliderService: SliderService) {}

  ngOnInit() {
    this.loadSliders();
  }

  loadSliders() {
    this.isLoading = true;
    this.error = null;

    this.subscription = this.sliderService.getActiveSliders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.slides = this.transformSliders(response.data);
        } else {
          this.slides = this.getDefaultSliders();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sliders:', error);
        this.error = 'Failed to load slider content';
        this.slides = this.getDefaultSliders();
        this.isLoading = false;
      }
    });
  }

  private transformSliders(sliders: Slider[]): any[] {
    return sliders.map(slider => ({
      background: slider.background_color || this.getRandomBackgroundColor(),
      title: slider.title || 'Default Title',
      description: slider.description || slider.subtitle || 'Default description',
      image: this.getImageUrl(slider.image),
      link: slider.button_url || '/shop',
      buttonText: slider.button_text || 'Shop now',
      textColor: slider.text_color || '#ffffff'
    }));
  }

  private getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    console.log("imagepath",imagePath);
    var tessss = `../../assets${imagePath}`;
    console.log("tessss",tessss)
    // Adjust this based on your image storage setup
    return `../../assets${imagePath}`;
  }

  private getRandomBackgroundColor(): string {
    const colors = ['#6dafca', '#5a7978', '#f99c03', '#4a6572', '#8d6e63'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getDefaultSliders(): any[] {
    // Fallback to your original static data
    return [
      {
        background: '#6dafca',
        title: 'Healthy Food Available to Everyone',
        description: '🔥 Free shipping - order over 50$',
        image: 'assets/cartzilla/img/home/grocery/hero-slider/01.jpg',
        link: '/shop',
        buttonText: 'Shop now',
        textColor: '#ffffff'
      },
      {
        background: '#5a7978',
        title: 'Organic eggs from home-grown chicken',
        description: '🥚 Organic products to your table',
        image: 'assets/cartzilla/img/home/grocery/hero-slider/02.jpg',
        link: '/shop',
        buttonText: 'Shop now',
        textColor: '#ffffff'
      },
      {
        background: '#f99c03',
        title: 'Enjoy refreshing summer drink',
        description: '🥝 Only natural ingredients',
        image: 'assets/cartzilla/img/home/grocery/hero-slider/03.jpg',
        link: '/shop',
        buttonText: 'Shop now',
        textColor: '#ffffff'
      }
    ];
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}