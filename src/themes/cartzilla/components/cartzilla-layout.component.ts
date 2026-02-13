import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartzillaService } from '../services/cartzilla.service';

@Component({
  selector: 'app-cartzilla-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cartzilla-layout.component.html',
  styleUrls: ['./cartzilla-layout.component.scss']
})
export class CartzillaLayoutComponent implements OnInit, OnDestroy {
  constructor(private cartzillaService: CartzillaService) {}

  ngOnInit() {
    this.cartzillaService.initializeCartzilla();
  }

  ngOnDestroy() {
    // Clean up if needed
  }
}