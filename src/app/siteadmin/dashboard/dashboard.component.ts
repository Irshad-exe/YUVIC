import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { rowsAnimation } from '@shared';
import { CommonModule, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { DashboardService } from './dashboard.service';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [rowsAnimation],
    imports: [
        BreadcrumbComponent,
        FeatherIconsComponent,
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatSelectModule,
        ReactiveFormsModule,
        FormsModule,
        MatCheckboxModule,
        MatTableModule,
        MatSortModule,
        NgClass,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatPaginatorModule,
    ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData: any = {};
  isLoading = true;
  private destroy$ = new Subject<void>();

  stats = [
    { title: 'Total Sales', value: 0, icon: 'attach_money', color: 'primary' },
    { title: 'Today Sales', value: 0, icon: 'today', color: 'accent' },
    { title: 'Monthly Sales', value: 0, icon: 'calendar_today', color: 'warn' },
    { title: 'Total Orders', value: 0, icon: 'shopping_cart', color: 'primary' },
    { title: 'Today Orders', value: 0, icon: 'receipt', color: 'accent' },
    { title: 'Total Customers', value: 0, icon: 'people', color: 'warn' },
    { title: 'Total Products', value: 0, icon: 'inventory_2', color: 'primary' },
    { title: 'Low Stock', value: 0, icon: 'warning', color: 'warn' }
  ];

  constructor(
    public httpClient: HttpClient,
    private DashboardService: DashboardService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.DashboardService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboardData = res.data;
          this.updateStats();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.isLoading = false;
      }
    });
  }

  updateStats() {
    const stats = this.dashboardData.stats;
    this.stats[0].value = stats?.totalSales || 0;
    this.stats[1].value = stats?.todaySales || 0;
    this.stats[2].value = stats?.monthlySales || 0;
    this.stats[3].value = stats?.totalOrders || 0;
    this.stats[4].value = stats?.todayOrders || 0;
    this.stats[5].value = stats?.totalCustomers || 0;
    this.stats[6].value = stats?.totalProducts || 0;
    this.stats[7].value = stats?.lowStockProducts || 0;
  }

  getMaxSales(): number {
    if (!this.dashboardData.salesChart) return 100;
    return Math.max(...this.dashboardData.salesChart.map((day: any) => day.sales));
  }

  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
}