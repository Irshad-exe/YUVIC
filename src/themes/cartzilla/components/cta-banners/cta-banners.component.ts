import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cartzilla-cta-banners',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cta-banners.component.html',
  styleUrls: ['./cta-banners.component.scss']
})
export class CartzillaCtaBannersComponent {}