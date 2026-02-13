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
import { ProductFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { ExcelImportDialogComponent } from './dialogs/excel-import-dialog/excel-import-dialog.component';
import { ProductService } from './product.service';
import { Product } from './product.model';
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
  selector: 'app-allproducts',
  templateUrl: './allproducts.component.html',
  styleUrls: ['./allproducts.component.scss'],
  //providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
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
export class AllProductsComponent implements OnInit, OnDestroy {
  columnDefinitions = [
    { def: 'select', label: 'Checkbox', type: 'check', visible: true },
    { def: 'name', label: 'Product Name', type: 'text', visible: true },
    { def: 'sku', label: 'SKU', type: 'text', visible: true },
    { def: 'category_name', label: 'Category', type: 'text', visible: true },
    { def: 'price', label: 'Price', type: 'text', visible: true },
    { def: 'quantity', label: 'Stock', type: 'text', visible: true },

    { def: 'actions', label: 'Actions', type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<Product>([]);
  selection = new SelectionModel<Product>(true, []);
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
    public productService: ProductService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) { }

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

  // allproducts.component.ts - Fix the loadData method
  loadData() {
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        // 🆕 FIXED: Proper status handling
        this.dataSource.data = res.data.map((row: any) => ({
          ...row,
          status: row.status ? 'Active' : 'Inactive', // Convert boolean to string for display
          statusBoolean: row.status // Keep original boolean value for form
        }));
        this.isLoading = false;
        this.refreshTable();
        this.dataSource.filterPredicate = (data: Product, filter: string) =>
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

  editCall(row: Product) {
    this.openDialog('edit', row);
  }

  openDialog(action: 'add' | 'edit', data?: Product) {
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '80vw',
      maxWidth: '100vw',
      data: { product: data, action },
      direction: varDirection,
      autoFocus: false,
      disableClose: true, // This prevents closing on backdrop click
      hasBackdrop: true, // Keep backdrop but disable closing
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (action === 'add') {
          this.dataSource.data = [result, ...this.dataSource.data];
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

  private updateRecord(updatedRecord: Product) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = updatedRecord;
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
      'Product Name': x.name,
      'SKU': x.sku,
      'Category': x.name,
      'Price': x.price,
      'Stock': x.quantity,
      'Status': x.status,
    }));

    //TableExportUtil.exportToExcel(exportData, 'products');
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  onContextMenu(event: MouseEvent, item: Product) {
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

    this.productService.deleteProducts(selectedIds).subscribe({
      next: (response) => {
        this.dataSource.data = this.dataSource.data.filter(
          (item) => !selectedIds.includes(item.id)
        );
        this.selection.clear();
        this.showNotification(
          'snackbar-danger',
          `${totalSelect} Product(s) Deleted Successfully...!!!`,
          'bottom',
          'center'
        );
      },
      error: (err) => {
        console.error('Error deleting products:', err);
        this.showNotification(
          'snackbar-danger',
          `Failed to delete products.`,
          'bottom',
          'center'
        );
      }
    });
  }

  openExcelImport(): void {
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }

    const dialogRef = this.dialog.open(ExcelImportDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      direction: varDirection,
      autoFocus: false,
      disableClose: false,
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.success) {
        this.loadData(); // Refresh the product list
        this.showNotification(
          'snackbar-success',
          `Successfully imported ${result.imported || 0} product(s)!`,
          'bottom',
          'center'
        );
      }
    });
  }
}