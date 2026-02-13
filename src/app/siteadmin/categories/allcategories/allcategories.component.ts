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
import { CategoryFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { CategoryService } from './category.service';
import { Category } from './category.model';
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
    selector: 'app-allcategories',
    templateUrl: './allcategories.component.html',
    styleUrls: ['./allcategories.component.scss'],
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
export class AllCategoriesComponent implements OnInit, OnDestroy {
  columnDefinitions = [
  { def: 'select', label: 'Checkbox', type: 'check', visible: true },
  { def: 'name', label: 'Category Name', type: 'text', visible: true },
  { def: 'slug', label: 'Slug', type: 'text', visible: false },
  { def: 'description', label: 'Description', type: 'text', visible: true },
  { def: 'status', label: 'Status', type: 'text', visible: true },
  { def: 'is_featured', label: 'Featured', type: 'text', visible: true },
  { def: 'sort_order', label: 'Sort Order', type: 'text', visible: false },
  { def: 'image_url', label: 'Image', type: 'text', visible: false },
  { def: 'meta_title', label: 'Meta Title', type: 'text', visible: false },
  { def: 'meta_description', label: 'Meta Description', type: 'text', visible: false },
  { def: 'created_at', label: 'Created At', type: 'text', visible: false },
  { def: 'actions', label: 'Actions', type: 'actionBtn', visible: true },
];

  dataSource = new MatTableDataSource<Category>([]);
  selection = new SelectionModel<Category>(true, []);
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
    public categoryService: CategoryService,
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
  this.categoryService.getAllCategories().subscribe({
    next: (res) => {
      this.dataSource.data = res.data; // Remove the mapping that was converting to strings
      this.isLoading = false;
      this.refreshTable();
      this.dataSource.filterPredicate = (data: Category, filter: string) =>
        Object.values(data).some((value) =>
          value !== null && value !== undefined &&
          value.toString().toLowerCase().includes(filter)
        );
    },
    error: (err) => console.error(err),
  });
}
 getParentCategoryName(parentId: string): string {
    if (!parentId) return '';
    const parent = this.dataSource.data.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Unknown';
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

  editCall(row: Category) {
    this.openDialog('edit', row);
  }

  openDialog(action: 'add' | 'edit', data?: Category) {
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: { category: data, action },
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

  private updateRecord(updatedRecord: Category) {
  const index = this.dataSource.data.findIndex(
    (record) => record.id === updatedRecord.id
  );
  if (index !== -1) {
    this.dataSource.data[index] = updatedRecord; // Use the record as-is
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
    'Category Name': x.name,
    'Slug': x.slug,
    'Description': x.description,
    'Status': x.status ? 'Active' : 'Inactive',
    'Featured': x.is_featured ? 'Yes' : 'No',
    'Sort Order': x.sort_order,
    'Created At': x.created_at
  }));

  // TableExportUtil.exportToExcel(exportData, 'categories');
}

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  onContextMenu(event: MouseEvent, item: Category) {
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

    this.categoryService.deleteCategories(selectedIds).subscribe({
      next: (response) => {
        this.dataSource.data = this.dataSource.data.filter(
          (item) => !selectedIds.includes(item.id)
        );
        this.selection.clear();
        this.showNotification(
          'snackbar-danger',
          `${totalSelect} Category(s) Deleted Successfully...!!!`,
          'bottom',
          'center'
        );
      },
      error: (err) => {
        console.error('Error deleting categories:', err);
        this.showNotification(
          'snackbar-danger',
          `Failed to delete categories.`,
          'bottom',
          'center'
        );
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.categoryService.importCategoriesFromCSV(file).subscribe({
        next: (response) => {
          this.showNotification(
            'snackbar-success',
            response.message,
            'bottom',
            'center'
          );
          this.loadData();
        },
        error: (err) => {
          this.showNotification(
            'snackbar-danger',
            'Failed to import CSV',
            'bottom',
            'center'
          );
        }
      });
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    fileInput?.click();
  }
}