import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
  MatDialogTitle,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { csv } from 'd3';
import { ProductService } from '../../product.service';
import { CategoryService } from '../../../../categories/allcategories/category.service';
import { BrandService } from '../../../../brand/allbrand/brand.service';
import { ProductTypeService } from '../../../../producttype/allproducttypes/producttype.service';

export interface ExcelProductRow {
  name: string;
  sku: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  quantity: number;
  parent_category_name?: string;
  sub_category_name?: string;
  category_id?: number;
  brand_name?: string;
  brand_id?: number;
  product_type_name?: string;
  product_type_id?: number;
  tags?: string;
  weight?: number;
  ingredients?: string;
  calories?: string;
  delivery_info?: string;
  is_featured?: boolean;
  is_published?: boolean;
  status?: boolean;
  errors?: string[];
  selected?: boolean;
}

@Component({
  selector: 'app-excel-import-dialog',
  templateUrl: './excel-import-dialog.component.html',
  styleUrls: ['./excel-import-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogContent,
    MatDialogClose,
    MatDialogTitle,
  ],
})
export class ExcelImportDialogComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  parsedData: ExcelProductRow[] = [];
  displayedColumns: string[] = [
    'select',
    'name',
    'sku',
    'price',
    'quantity',
    'category',
    'status',
    'errors',
  ];
  isLoading = false;
  importProgress = 0;
  isImporting = false;
  selectedRows = new Set<number>();
  allSelected = false;

  categories: any[] = [];
  brands: any[] = [];
  productTypes: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ExcelImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private productTypeService: ProductTypeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReferenceData();
  }

  triggerFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  loadReferenceData(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res.data || [];
      },
      error: (err) => console.error('Error loading categories:', err),
    });

    this.brandService.getAllBrands().subscribe({
      next: (res) => {
        this.brands = res.data || [];
      },
      error: (err) => console.error('Error loading brands:', err),
    });

    this.productTypeService.getAllProductTypes().subscribe({
      next: (res) => {
        this.productTypes = res.data || [];
      },
      error: (err) => console.error('Error loading product types:', err),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.name.endsWith('.csv')) {
        this.processCSVFile(file);
      } else {
        this.processExcelFile(file);
      }
    }
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        if (file.name.endsWith('.csv')) {
          this.processCSVFile(file);
        } else {
          this.processExcelFile(file);
        }
      } else {
        this.showError('Please upload a valid Excel file (.xlsx, .xls) or CSV file (.csv)');
      }
    }
  }

  processCSVFile(file: File): void {
    this.isLoading = true;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const csvData = e.target.result;
        const workbook = XLSX.read(csvData, { type: 'string' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        this.parsedData = jsonData.map((row, index) => {
          const productRow: ExcelProductRow = {
            name: this.getStringValue(row, 'name', 'product name'),
            sku: this.getStringValue(row, 'sku', 'SKU'),
            description: this.getStringValue(row, 'description', 'description'),
            short_description: this.getStringValue(
              row,
              'short_description',
              'short description'
            ),
            price: this.getNumberValue(row, 'price', 'price'),
            compare_price: this.getNumberValue(row, 'compare_price', 'compare price'),
            cost_price: this.getNumberValue(row, 'cost_price', 'cost price'),
            quantity: this.getNumberValue(row, 'quantity', 'stock', 0),
            parent_category_name: this.getStringValue(row, 'parent_category', 'parent category'),
            sub_category_name: this.getStringValue(row, 'sub_category', 'sub category'),
            brand_name: this.getStringValue(row, 'brand', 'brand'),
            product_type_name: this.getStringValue(
              row,
              'product_type',
              'product type'
            ),
            tags: this.getStringValue(row, 'tags', 'tags'),
            weight: this.getNumberValue(row, 'weight', 'weight'),
            ingredients: this.getStringValue(row, 'ingredients', 'ingredients'),
            calories: this.getStringValue(row, 'calories', 'calories'),
            delivery_info: this.getStringValue(
              row,
              'delivery_info',
              'delivery info'
            ),
            is_featured: this.getBooleanValue(row, 'is_featured', 'is featured'),
            is_published: this.getBooleanValue(
              row,
              'is_published',
              'is published',
              true
            ),
            status: this.getBooleanValue(row, 'status', 'status', true),
            selected: true,
            errors: [],
          };

          if (productRow.sub_category_name) {
            const subCategory = this.categories.find(
              (c) =>
                c.name?.toLowerCase() === productRow.sub_category_name?.toLowerCase() &&
                c.parent_id
            );
            if (subCategory) {
              productRow.category_id = subCategory.id;
            } else {
              productRow.errors?.push(
                `Sub Category "${productRow.sub_category_name}" not found`
              );
            }
          }

          if (productRow.brand_name) {
            const brand = this.brands.find(
              (b) => b.name?.toLowerCase() === productRow.brand_name?.toLowerCase()
            );
            if (brand) {
              productRow.brand_id = brand.id;
            } else {
              productRow.errors?.push(`Brand "${productRow.brand_name}" not found`);
            }
          }

          if (productRow.product_type_name) {
            const productType = this.productTypes.find(
              (pt) =>
                pt.name?.toLowerCase() ===
                productRow.product_type_name?.toLowerCase()
            );
            if (productType) {
              productRow.product_type_id = productType.id;
            } else {
              productRow.errors?.push(
                `Product Type "${productRow.product_type_name}" not found`
              );
            }
          }

          this.validateRow(productRow, index + 2);

          return productRow;
        });

        this.isLoading = false;
        if (this.parsedData.length === 0) {
          this.showError('No data found in CSV file');
        } else {
          this.showSuccess(`Loaded ${this.parsedData.length} products from CSV`);
        }
      } catch (error: any) {
        this.isLoading = false;
        this.showError(`Error reading CSV file: ${error.message}`);
      }
    };

    reader.onerror = () => {
      this.isLoading = false;
      this.showError('Error reading file');
    };

    reader.readAsText(file);
  }

  processExcelFile(file: File): void {
    this.isLoading = true;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        this.parsedData = jsonData.map((row, index) => {
          const productRow: ExcelProductRow = {
            name: this.getStringValue(row, 'name', 'product name'),
            sku: this.getStringValue(row, 'sku', 'SKU'),
            description: this.getStringValue(row, 'description', 'description'),
            short_description: this.getStringValue(
              row,
              'short_description',
              'short description'
            ),
            price: this.getNumberValue(row, 'price', 'price'),
            compare_price: this.getNumberValue(row, 'compare_price', 'compare price'),
            cost_price: this.getNumberValue(row, 'cost_price', 'cost price'),
            quantity: this.getNumberValue(row, 'quantity', 'stock', 0),
            parent_category_name: this.getStringValue(row, 'parent_category', 'parent category'),
            sub_category_name: this.getStringValue(row, 'sub_category', 'sub category'),
            brand_name: this.getStringValue(row, 'brand', 'brand'),
            product_type_name: this.getStringValue(
              row,
              'product_type',
              'product type'
            ),
            tags: this.getStringValue(row, 'tags', 'tags'),
            weight: this.getNumberValue(row, 'weight', 'weight'),
            ingredients: this.getStringValue(row, 'ingredients', 'ingredients'),
            calories: this.getStringValue(row, 'calories', 'calories'),
            delivery_info: this.getStringValue(
              row,
              'delivery_info',
              'delivery info'
            ),
            is_featured: this.getBooleanValue(row, 'is_featured', 'is featured'),
            is_published: this.getBooleanValue(
              row,
              'is_published',
              'is published',
              true
            ),
            status: this.getBooleanValue(row, 'status', 'status', true),
            selected: true,
            errors: [],
          };

          // Map sub category name to ID
          if (productRow.sub_category_name) {
            const subCategory = this.categories.find(
              (c) =>
                c.name?.toLowerCase() === productRow.sub_category_name?.toLowerCase() &&
                c.parent_id
            );
            if (subCategory) {
              productRow.category_id = subCategory.id;
            } else {
              productRow.errors?.push(
                `Sub Category "${productRow.sub_category_name}" not found`
              );
            }
          }

          // Map brand name to ID
          if (productRow.brand_name) {
            const brand = this.brands.find(
              (b) => b.name?.toLowerCase() === productRow.brand_name?.toLowerCase()
            );
            if (brand) {
              productRow.brand_id = brand.id;
            } else {
              productRow.errors?.push(`Brand "${productRow.brand_name}" not found`);
            }
          }

          // Map product type name to ID
          if (productRow.product_type_name) {
            const productType = this.productTypes.find(
              (pt) =>
                pt.name?.toLowerCase() ===
                productRow.product_type_name?.toLowerCase()
            );
            if (productType) {
              productRow.product_type_id = productType.id;
            } else {
              productRow.errors?.push(
                `Product Type "${productRow.product_type_name}" not found`
              );
            }
          }

          // Validate required fields
          this.validateRow(productRow, index + 2); // +2 because Excel rows start at 1 and we have header

          return productRow;
        });

        this.isLoading = false;
        if (this.parsedData.length === 0) {
          this.showError('No data found in Excel file');
        } else {
          this.showSuccess(`Loaded ${this.parsedData.length} products from Excel`);
        }
      } catch (error: any) {
        this.isLoading = false;
        this.showError(`Error reading Excel file: ${error.message}`);
      }
    };

    reader.onerror = () => {
      this.isLoading = false;
      this.showError('Error reading file');
    };

    reader.readAsArrayBuffer(file);
  }

  validateRow(row: ExcelProductRow, rowNumber: number): void {
    if (!row.name || row.name.trim() === '') {
      row.errors?.push('Product name is required');
    }
    if (!row.sku || row.sku.trim() === '') {
      row.errors?.push('SKU is required');
    }
    if (row.price === null || row.price === undefined || row.price < 0) {
      row.errors?.push('Valid price is required');
    }
    if (row.quantity === null || row.quantity === undefined || row.quantity < 0) {
      row.errors?.push('Valid quantity is required');
    }
  }

  getStringValue(row: any, ...keys: string[]): string {
    for (const key of keys) {
      const value = row[key] || row[key.toLowerCase()] || row[key.toUpperCase()];
      if (value !== undefined && value !== null) {
        return String(value).trim();
      }
    }
    return '';
  }

  getNumberValue(
    row: any,
    key: string,
    altKey?: string,
    defaultValue: number = 0
  ): number {
    const keys = [key, altKey].filter(Boolean) as string[];
    for (const k of keys) {
      const value = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()];
      if (value !== undefined && value !== null && value !== '') {
        const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? defaultValue : num;
      }
    }
    return defaultValue;
  }

  getBooleanValue(
    row: any,
    key: string,
    altKey?: string,
    defaultValue: boolean = false
  ): boolean {
    const keys = [key, altKey].filter(Boolean) as string[];
    for (const k of keys) {
      const value = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()];
      if (value !== undefined && value !== null && value !== '') {
        const str = String(value).toLowerCase().trim();
        return str === 'true' || str === 'yes' || str === '1' || str === 'y';
      }
    }
    return defaultValue;
  }

  get errorCount(): number {
    return this.parsedData.reduce(
      (count, _, index) => (this.hasErrors(index) ? count + 1 : count),
      0
    );
  }

  toggleRowSelection(index: number): void {
    if (this.selectedRows.has(index)) {
      this.selectedRows.delete(index);
    } else {
      this.selectedRows.add(index);
    }
    this.updateAllSelected();
  }

  toggleAllSelection(): void {
    if (this.allSelected) {
      this.selectedRows.clear();
    } else {
      this.parsedData.forEach((_, index) => {
        if (!this.hasErrors(index)) {
          this.selectedRows.add(index);
        }
      });
    }
    this.updateAllSelected();
  }

  updateAllSelected(): void {
    const validRows = this.parsedData.filter((_, index) => !this.hasErrors(index));
    this.allSelected =
      validRows.length > 0 &&
      validRows.every((_, index) => this.selectedRows.has(index));
  }

  hasErrors(index: number): boolean {
    return (
      (this.parsedData[index]?.errors?.length || 0) > 0
    );
  }

  getSelectedRows(): ExcelProductRow[] {
    return this.parsedData.filter((_, index) => this.selectedRows.has(index));
  }

  async importProducts(): Promise<void> {
    const selectedRows = this.getSelectedRows();
    if (selectedRows.length === 0) {
      this.showError('Please select at least one product to import');
      return;
    }

    const rowsWithErrors = selectedRows.filter((row) => row.errors && row.errors.length > 0);
    if (rowsWithErrors.length > 0) {
      this.showError(
        `Cannot import ${rowsWithErrors.length} product(s) with errors. Please fix them first.`
      );
      return;
    }

    this.isImporting = true;
    this.importProgress = 0;
    const total = selectedRows.length;
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedRows.length; i++) {
      const row = selectedRows[i];
      try {
        await this.importSingleProduct(row);
        successCount++;
      } catch (error: any) {
        errorCount++;
        errors.push(`${row.name} (${row.sku}): ${error.message || 'Import failed'}`);
      }

      this.importProgress = Math.round(((i + 1) / total) * 100);
    }

    this.isImporting = false;

    if (errorCount === 0) {
      this.showSuccess(`Successfully imported ${successCount} product(s)`);
      this.dialogRef.close({ success: true, imported: successCount });
    } else {
      this.showError(
        `Imported ${successCount} product(s), ${errorCount} failed. Errors: ${errors.join('; ')}`
      );
      if (successCount > 0) {
        this.dialogRef.close({ success: true, imported: successCount, errors });
      }
    }
  }

  importSingleProduct(row: ExcelProductRow): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();

      // Add all product fields
      formData.append('name', row.name);
      formData.append('sku', row.sku);
      formData.append('description', row.description || '');
      formData.append('short_description', row.short_description || '');
      formData.append('price', row.price.toString());
      if (row.compare_price) {
        formData.append('compare_price', row.compare_price.toString());
      }
      if (row.cost_price) {
        formData.append('cost_price', row.cost_price.toString());
      }
      formData.append('quantity', row.quantity.toString());
      if (row.category_id) {
        formData.append('category_id', row.category_id.toString());
      }
      if (row.brand_id) {
        formData.append('brand_id', row.brand_id.toString());
      }
      if (row.product_type_id) {
        formData.append('product_type_id', row.product_type_id.toString());
      }
      if (row.tags) {
        const tagsArray = row.tags.split(',').map((t) => t.trim()).filter((t) => t);
        formData.append('tags', JSON.stringify(tagsArray));
      } else {
        formData.append('tags', JSON.stringify([]));
      }
      if (row.weight) {
        formData.append('weight', row.weight.toString());
      }
      if (row.ingredients) {
        formData.append('ingredients', row.ingredients);
      }
      if (row.calories) {
        formData.append('calories', row.calories);
      }
      if (row.delivery_info) {
        formData.append('delivery_info', row.delivery_info);
      }
      formData.append('is_featured', row.is_featured ? 'true' : 'false');
      formData.append('is_published', row.is_published !== false ? 'true' : 'false');
      formData.append('status', row.status !== false ? '1' : '0');
      formData.append('track_quantity', 'true');
      formData.append('specifications', JSON.stringify({}));
      formData.append('dimensions', JSON.stringify({}));
      formData.append('existing_images', JSON.stringify([]));

      this.productService.addProductWithImages(formData).subscribe({
        next: (res) => {
          resolve(res);
        },
        error: (err) => {
          reject(
            new Error(
              err.error?.message || err.message || 'Failed to import product'
            )
          );
        },
      });
    });
  }

  downloadTemplate(): void {
    const templateData = [
      {
        name: 'Sample Product',
        sku: 'SKU-001',
        description: 'Product description here',
        short_description: 'Short description',
        price: 99.99,
        compare_price: 129.99,
        cost_price: 50.00,
        quantity: 100,
        parent_category: 'Body Wash',
        sub_category: 'Vitamin C',
        brand: 'Brand Name',
        product_type: 'Product Type Name',
        tags: 'tag1, tag2, tag3',
        weight: 0.5,
        ingredients: 'Ingredient list',
        calories: '100 cal',
        delivery_info: 'Delivery information',
        is_featured: false,
        is_published: true,
        status: true,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product_import_template.xlsx');
    this.showSuccess('Template downloaded successfully');
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success'],
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['snackbar-danger'],
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
