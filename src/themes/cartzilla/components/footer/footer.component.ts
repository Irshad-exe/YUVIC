import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cartzilla-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class CartzillaFooterComponent {
  currentYear = new Date().getFullYear();
  
  // ... rest of the component code remains the same
   footerLinks = {
    categories: [
      { name: 'Body wash', link: '/shop' },
      { name: 'Face pack', link: '/shop' },
      { name: 'Conditioner', link: '/shop' },
      { name: 'Shampoo', link: '/shop' },
      { name: 'ACV TABLET', link: '/shop' },
      { name: 'Body lotion', link: '/shop' }
    ],
    company: [
     
      { name: 'About us', link: '/cms/aboutus' },
      { name: 'FAQ page', link: '/faq' },
      { name: 'Contact us', link: '/contact' },
    
    ]
  };
}