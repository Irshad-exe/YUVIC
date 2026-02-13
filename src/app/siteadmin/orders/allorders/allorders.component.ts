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
import { rowsAnimation, TableExportUtil } from '@shared';
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
import { OrderService } from './orders.service';
import { OrderStatusUpdateComponent } from './dialogs/form-dialog/form-dialog.component';

@Component({
    selector: 'app-admin-orders',
    templateUrl: './allorders.component.html',
    styleUrls: ['./allorders.component.scss'],
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
export class AllOrdersComponent implements OnInit, OnDestroy {
  columnDefinitions = [
    { def: 'select', label: 'Checkbox', type: 'check', visible: true },
    { def: 'order_number', label: 'Order ID', type: 'text', visible: true },
    { def: 'customer', label: 'Customer', type: 'text', visible: true },
    { def: 'amount', label: 'Amount', type: 'text', visible: true },
    { def: 'payment_status', label: 'Payment', type: 'text', visible: true },
    { def: 'order_status', label: 'Status', type: 'text', visible: true },
    { def: 'created_at', label: 'Date', type: 'text', visible: true },
    { def: 'actions', label: 'Actions', type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    private orderService: OrderService,
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

  getDisplayedColumns(): string[] {
    return this.columnDefinitions
      .filter((cd) => cd.visible)
      .map((cd) => cd.def);
  }

  loadData() {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (res) => {
        this.dataSource.data = res.data || [];
        this.isLoading = false;
        this.refreshTable();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private refreshTable() {
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  updateStatus(row: any) {
    const dialogRef = this.dialog.open(OrderStatusUpdateComponent, {
      width: '400px',
      data: { order: row },
      disableClose: true, // This prevents closing on backdrop click
    hasBackdrop: true, // Keep backdrop but disable closing
      
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.orderService.updateOrderStatus(row.id, result).subscribe({
          next: (res) => {
            row.order_status = result;
            this.showNotification('snackbar-success', 'Order status updated successfully!', 'bottom', 'center');
          },
          error: (err) => {
            this.showNotification('snackbar-danger', 'Failed to update order status', 'bottom', 'center');
          }
        });
      }
    });
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

  exportExcel() {
    const exportData = this.dataSource.filteredData.map((x) => ({
      'Order ID': x.order_number,
      'Customer': x.User?.name,
      'Amount': x.final_amount,
      'Payment Status': x.payment_status,
      'Order Status': x.order_status,
      'Date': x.created_at
    }));

    TableExportUtil.exportToExcel(exportData, 'orders');
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }
}