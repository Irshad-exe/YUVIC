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
import { fromEvent, Subject } from 'rxjs';
import { CouponFormDialogComponent } from './dialogs/form-dialog/form-dialog.component';
import { CouponService } from './coupon.service';
import { rowsAnimation, TableExportUtil } from '@shared';
import { formatDate, DatePipe, CommonModule, NgClass } from '@angular/common';
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
import { Direction } from '@angular/cdk/bidi';
import { AuthService } from '@core/service/auth.service';

@Component({
    selector: 'app-allcoupons',
    templateUrl: './allcoupons.component.html',
    styleUrls: ['./allcoupons.component.scss'],
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
export class AllCouponsComponent implements OnInit, OnDestroy {
  columnDefinitions = [
    { def: 'select', label: 'Checkbox', type: 'check', visible: true },
    { def: 'code', label: 'Coupon Code', type: 'text', visible: true },
    { def: 'type', label: 'Type', type: 'text', visible: true },
    { def: 'value', label: 'Value', type: 'text', visible: true },
    { def: 'min_order_amount', label: 'Min Order', type: 'text', visible: true },
    { def: 'usage_limit', label: 'Usage Limit', type: 'text', visible: true },
    { def: 'used_count', label: 'Used', type: 'text', visible: true },
    { def: 'valid_from', label: 'Valid From', type: 'text', visible: true },
    { def: 'valid_until', label: 'Valid Until', type: 'text', visible: true },
    { def: 'status', label: 'Status', type: 'text', visible: true },
    { def: 'actions', label: 'Actions', type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public couponService: CouponService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
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
    this.couponService.getAllCoupons().subscribe({
      next: (res) => {
        this.dataSource.data = res.data.map((row: any) => ({
          ...row,
          status: row.status ? 'Active' : 'Inactive',
          valid_from: formatDate(row.valid_from, 'yyyy-MM-dd', 'en'),
          valid_until: formatDate(row.valid_until, 'yyyy-MM-dd', 'en'),
          type: row.type === 'percentage' ? 'Percentage' : 'Fixed Amount',
          value: row.type === 'percentage' ? `${row.value}%` : `₹${row.value}`
        }));
        this.isLoading = false;
        this.refreshTable();
        this.dataSource.filterPredicate = (data: any, filter: string) =>
          Object.values(data).some((value) =>
            value !== null && value !== undefined &&
            value.toString().toLowerCase().includes(filter)
          );
      },
      error: (err) => console.error(err),
    });
  }

  private refreshTable() {
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  addNew() {
    this.openDialog('add');
  }

  editCall(row: any) {
    this.openDialog('edit', row);
  }

  openDialog(action: 'add' | 'edit', data?: any) {
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(CouponFormDialogComponent, {
      width: '80vw',
      maxWidth: '100vw',
      data: { coupon: data, action },
      direction: varDirection,
      autoFocus: false,
      disableClose: true, // This prevents closing on backdrop click
    hasBackdrop: true, // Keep backdrop but disable closing
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (action === 'add') {
          this.dataSource.data = [{
            ...result,
            status: result.status ? 'Active' : 'Inactive',
            valid_from: formatDate(result.valid_from, 'yyyy-MM-dd', 'en'),
            valid_until: formatDate(result.valid_until, 'yyyy-MM-dd', 'en'),
            type: result.type === 'percentage' ? 'Percentage' : 'Fixed Amount',
            value: result.type === 'percentage' ? `${result.value}%` : `₹${result.value}`
          }, ...this.dataSource.data];
        } else {
          this.updateRecord(result);
        }
        this.refreshTable();
        this.showNotification(
          action === 'add' ? 'snackbar-success' : 'black',
          `${action === 'add' ? 'Add' : 'Edit'} Record Successfully...!!!`,
          'bottom',
          'center'
        );
      }
    });
  }

  private updateRecord(updatedRecord: any) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = {
        ...updatedRecord,
        status: updatedRecord.status ? 'Active' : 'Inactive',
        valid_from: formatDate(updatedRecord.valid_from, 'yyyy-MM-dd', 'en'),
        valid_until: formatDate(updatedRecord.valid_until, 'yyyy-MM-dd', 'en'),
        type: updatedRecord.type === 'percentage' ? 'Percentage' : 'Fixed Amount',
        value: updatedRecord.type === 'percentage' ? `${updatedRecord.value}%` : `₹${updatedRecord.value}`
      };
      this.dataSource._updateChangeSubscription();
    }
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
      'Coupon Code': x.code,
      'Type': x.type,
      'Value': x.value,
      'Min Order Amount': x.min_order_amount,
      'Usage Limit': x.usage_limit,
      'Used Count': x.used_count,
      'Valid From': x.valid_from,
      'Valid Until': x.valid_until,
      'Status': x.status,
    }));

    TableExportUtil.exportToExcel(exportData, 'coupons');
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  onContextMenu(event: MouseEvent, item: any) {
    event.preventDefault();
    this.contextMenuPosition = {
      x: `${event.clientX}px`,
      y: `${event.clientY}px`,
    };
    if (this.contextMenu) {
      this.contextMenu.menuData = { item };
      this.contextMenu.menu?.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

  removeSelectedRows() {
    const selectedIds = this.selection.selected.map((item: any) => item.id);
    const totalSelect = selectedIds.length;

    this.couponService.deleteCoupons(selectedIds).subscribe({
      next: (response) => {
        this.dataSource.data = this.dataSource.data.filter(
          (item) => !selectedIds.includes(item.id)
        );
        this.selection.clear();
        this.showNotification(
          'snackbar-danger',
          `${totalSelect} Coupon(s) Deleted Successfully...!!!`,
          'bottom',
          'center'
        );
      },
      error: (err) => {
        console.error('Error deleting coupons:', err);
        this.showNotification(
          'snackbar-danger',
          `Failed to delete coupons.`,
          'bottom',
          'center'
        );
      }
    });
  }
}