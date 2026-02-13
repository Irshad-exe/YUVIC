import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../product.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Product } from '../../product.model';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox'; // 🆕 Added
import { MatChipsModule } from '@angular/material/chips'; // 🆕 Added
import { CategoryService } from '../../../../categories/allcategories/category.service';
import { ProductTypeService } from '../../../../producttype/allproducttypes/producttype.service'; // 🆕 Added
import { BrandService } from '../../../../brand/allbrand/brand.service'; // 🆕 Added
import { AuthService } from '@core/service/auth.service';
import { Router } from '@angular/router';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';

export interface DialogData {
  id: number;
  action: string;
  product: Product;
}

interface ProductImage {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
  url?: string;
}

@Component({
  selector: 'app-product-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogClose,
    MatCheckboxModule, // 🆕 Added
    MatChipsModule, // 🆕 Added
    MatAutocompleteModule, // 🆕 Added
    CommonModule
  ]
})
export class ProductFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  action: string;
  dialogTitle: string;
  productForm!: UntypedFormGroup;
  product: Product;
  categories: any[] = [];
  parentCategories: any[] = [];
  subCategories: any[] = [];
  brands: any[] = []; // 🆕 Added
  token: any;
  today: Date = new Date();

  // File upload properties
  selectedFiles: File[] = [];
  uploadedImages: ProductImage[] = [];
  deletedImages: string[] = [];
  isDragging = false;
  maxFileSize = 5 * 1024 * 1024;
  acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  // Profit calculation properties
  profitMargin: number = 0;
  profitAmount: number = 0;

  // 🆕 Cartzilla Additional Properties
  separatorKeysCodes: number[] = [ENTER, COMMA];
  allTags: string[] = ['Electronics', 'Fashion', 'Home', 'Kitchen', 'Sports', 'Books', 'Beauty']; // Predefined tags
  filteredTags: string[] = [];
  showSuccessNotification: any;
  showErrorNotification: any;
  tagInputControl = new UntypedFormControl();
  productTypes: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public productService: ProductService,
    private fb: UntypedFormBuilder,
    public categoryService: CategoryService,
    public productTypeService: ProductTypeService, // 🆕 Added
    public brandService: BrandService, // 🆕 Added
    private authService: AuthService,
    private router: Router,
    private _liveAnnouncer: LiveAnnouncer // 🆕 Added for tags
  ) {
    this.action = data.action;
    this.dialogTitle = this.action === 'edit' ? `Edit ${data.product.name}` : 'Add New Product';
    this.product = this.action === 'edit' ? data.product : new Product({});
    this.productForm = this.createProductForm();

    // Initialize existing data
    if (this.action === 'edit') {
      this.initializeExistingImages();
      this.filteredTags = this.allTags.slice();
    }
  }

  // 🆕 Also fix the status dropdown in ngOnInit
  ngOnInit(): void {
    this.token = this.authService.getDecodeToken();
    this.fetchCategories();
    this.fetchBrands();
    this.fetchProductTypes();

    // Listen to price changes for profit calculation
    this.productForm.get('price')?.valueChanges.subscribe(() => {
      this.calculateProfit();
    });

    this.productForm.get('cost_price')?.valueChanges.subscribe(() => {
      this.calculateProfit();
    });

    // Listen to tag changes
    this.productForm.get('tags')?.valueChanges.subscribe(() => {
      this.filterTags();
    });

    this.calculateProfit();
  }
  // 🆕 Create updated form with Cartzilla fields
  // form-dialog.component.ts - Fix status handling in form
  // In the createProductForm method:
  createProductForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.product.id],
      name: [this.product.name, [Validators.required, Validators.minLength(2)]],
      slug: [this.product.slug || this.generateSlug(this.product.name), [Validators.required]],
      sku: [this.product.sku || this.generateSKU(), [Validators.required]],
      description: [this.product.description],
      short_description: [this.product.short_description],
      price: [this.product.price, [Validators.required, Validators.min(0)]],
      compare_price: [this.product.compare_price || 0, [Validators.min(0)]],
      cost_price: [this.product.cost_price || 0, [Validators.min(0)]],
      quantity: [this.product.quantity, [Validators.required, Validators.min(0)]],
      parent_category_id: [null],
      category_id: [this.product.category_id, [Validators.required]],
      product_type_id: [this.product.product_type_id, [Validators.required]],
      brand_id: [this.product.brand_id],
      //  status: [this.product.status !== undefined ? this.product.status : true, [Validators.required]],
      is_featured: [this.product.is_featured || false],
      is_published: [this.product.is_published !== undefined ? this.product.is_published : true],
      track_quantity: [this.product.track_quantity !== undefined ? this.product.track_quantity : true],
      weight: [this.product.weight || 0, [Validators.min(0)]],
      tags: [this.product.tags || []],
      seo_title: [this.product.seo_title || ''],
      seo_description: [this.product.seo_description || ''],
      specifications: [this.product.specifications || {}],
      dimensions: [this.product.dimensions || {}],
      // 🆕 Added fields
      ingredients: [this.product.ingredients || ''],
      calories: [this.product.calories || ''],
      delivery_info: [this.product.delivery_info || '']
    });
  }


  // 🆕 Generate slug from product name
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  // 🆕 Generate SKU
  private generateSKU(): string {
    return `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  fetchCategories() {
    this.categoryService.getAllCategories().subscribe(res => {
      this.categories = res.data || [];
      this.parentCategories = this.categories.filter(cat => !cat.parent_id);
      
      if (this.action === 'edit' && this.product.category_id) {
        const selectedCategory = this.categories.find(c => c.id === this.product.category_id);
        if (selectedCategory?.parent_id) {
          this.productForm.patchValue({ parent_category_id: selectedCategory.parent_id });
          this.onParentCategoryChange(selectedCategory.parent_id);
        }
      }
    });
  }

  onParentCategoryChange(parentId: any) {
    if (parentId) {
      this.subCategories = this.categories.filter(cat => cat.parent_id === parentId);
      if (this.action !== 'edit') {
        this.productForm.patchValue({ category_id: null });
      }
    } else {
      this.subCategories = [];
    }
  }
  fetchProductTypes() {
    this.productTypeService.getAllProductTypes().subscribe(res => {
      this.productTypes = res.data || [];
    });
  }

  // 🆕 Fetch brands
  fetchBrands() {
    this.brandService.getAllBrands().subscribe(res => {
      this.brands = res.data || [];
    });
  }

  // 🆕 Tag management methods
  addTag(event: any): void {
    const value = (event.value || '').trim();

    if (value) {
      const currentTags = this.productForm.get('tags')?.value || [];
      if (!currentTags.includes(value)) {
        currentTags.push(value);
        this.productForm.get('tags')?.setValue(currentTags);
      }
    }

    this.clearTagInput();
  }

  removeTag(tag: string): void {
    const currentTags = this.productForm.get('tags')?.value || [];
    const index = currentTags.indexOf(tag);

    if (index >= 0) {
      currentTags.splice(index, 1);
      this.productForm.get('tags')?.setValue(currentTags);
      this._liveAnnouncer.announce(`Removed ${tag}`);
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    this.addTag({ value: event.option.viewValue });
  }

  private clearTagInput(): void {
    if (this.tagInput?.nativeElement) {
      this.tagInput.nativeElement.value = '';
    }
  }

  private filterTags(): void {
    const currentTags = this.productForm.get('tags')?.value || [];
    const filterValue = this.tagInput?.nativeElement?.value?.toLowerCase() || '';

    this.filteredTags = this.allTags.filter(tag =>
      tag.toLowerCase().includes(filterValue) && !currentTags.includes(tag)
    );
  }

  // 🆕 Add specification field
  addSpecification(): void {
    const specifications = this.productForm.get('specifications')?.value || {};
    const key = `spec_${Date.now()}`;
    specifications[key] = { key: '', value: '' };
    this.productForm.get('specifications')?.setValue(specifications);
  }

  // 🆕 Remove specification field
  removeSpecification(key: string): void {
    const specifications = this.productForm.get('specifications')?.value || {};
    delete specifications[key];
    this.productForm.get('specifications')?.setValue(specifications);
  }

  // 🆕 Track by function for specifications
  trackByFn(index: number, item: any): any {
    return item.key || index;
  }

  // Handle existing images - they might be strings or ProductImage objects
  private initializeExistingImages(): void {
    if (Array.isArray(this.product.images)) {
      this.uploadedImages = this.product.images.map((img: any) => {
        // If it's already a ProductImage object, use it as is
        if (typeof img === 'object' && img.filename) {
          return {
            filename: img.filename,
            originalname: img.originalname || img.filename,
            path: img.path || img.url || '',
            size: img.size || 0,
            mimetype: img.mimetype || 'image/jpeg',
            url: this.getImageUrl(img)
          };
        }
        // If it's a string (file path or URL), convert to ProductImage
        else if (typeof img === 'string') {
          return {
            filename: this.extractFilename(img),
            originalname: this.extractFilename(img),
            path: img,
            size: 0,
            mimetype: 'image/jpeg',
            url: img
          };
        }
        // Fallback for any other type
        return {
          filename: 'unknown',
          originalname: 'unknown',
          path: '',
          size: 0,
          mimetype: 'image/jpeg',
          url: ''
        };
      });
    }
  }

  // Extract filename from path/URL
  private extractFilename(path: string): string {
    if (!path) return 'unknown';
    return path.split('/').pop() || path.split('\\').pop() || 'unknown';
  }

  // Get proper image URL for display
  private getImageUrl(img: any): string {
    console.log("img", img);
    if (img.url) return img.url;
    if (img.filename) return 'assets/uploads/products/' + img.filename;
    if (typeof img === 'string') return img;
    return '';
  }


  // File upload methods
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.processFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  processFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!this.acceptedFileTypes.includes(file.type)) {
        this.showErrorNotification('Invalid file type. Please upload only images (JPEG, PNG, GIF, WebP).');
        continue;
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        this.showErrorNotification(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      this.selectedFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image: ProductImage = {
          filename: file.name, // Temporary filename for new files
          originalname: file.name,
          path: e.target.result,
          size: file.size,
          mimetype: file.type,
          url: e.target.result
        };
        this.uploadedImages.push(image);
      };
      reader.readAsDataURL(file);
    }

    // Reset file input
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removeImage(index: number, image: ProductImage): void {
    // If it's an existing image (has a proper filename that's not just the original name), add to deleted images
    if (image.filename && image.filename !== image.originalname && !image.filename.startsWith('blob:')) {
      this.deletedImages.push(image.filename);
    }

    // Remove from uploaded images
    this.uploadedImages.splice(index, 1);

    // Remove from selected files if it's a new file
    const fileIndex = this.selectedFiles.findIndex(file => file.name === image.originalname);
    if (fileIndex > -1) {
      this.selectedFiles.splice(fileIndex, 1);
    }
  }

  triggerFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  // Calculate profit margin and amount
  calculateProfit(): void {
    const price = this.productForm.get('price')?.value || 0;
    const costPrice = this.productForm.get('cost_price')?.value || 0;

    // Calculate profit amount
    this.profitAmount = price - costPrice;

    // Calculate profit margin percentage
    if (costPrice > 0) {
      this.profitMargin = ((price - costPrice) / costPrice) * 100;
    } else {
      this.profitMargin = 0;
    }
  }

  // Get profit margin for display
  getProfitMargin(): number {
    return this.profitMargin;
  }

  // Get profit amount for display
  getProfitAmount(): number {
    return this.profitAmount;
  }

  // Check if profit is positive
  isProfitPositive(): boolean {
    return this.profitMargin > 0;
  }
  submit() {
    if (this.productForm.valid) {
      const formData = new FormData();

      // Append form data
      Object.keys(this.productForm.value).forEach(key => {
        const value = this.productForm.value[key];

        // Handle different data types
        if (value !== null && value !== undefined) {
          if (typeof value === 'object' && !(value instanceof File)) {
            // Convert objects and arrays to JSON strings
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append existing images
      const existingImages = this.uploadedImages.filter(img =>
        !this.selectedFiles.some(file => file.name === img.originalname)
      );
      formData.append('existing_images', JSON.stringify(existingImages));

      // Append deleted images
      if (this.action === 'edit' && this.deletedImages.length > 0) {
        formData.append('deleted_images', JSON.stringify(this.deletedImages));
      }

      // Append new files
      this.selectedFiles.forEach(file => {
        formData.append('images', file, file.name);
      });

      if (this.action === 'edit') {
        this.productService.updateProductWithImages(formData).subscribe({
          next: (res) => {
            this.dialogRef.close(res.data);
            this.showSuccessNotification('Product updated successfully!');
          },
          error: (err) => {
            console.error('Error updating product:', err);
            this.showErrorNotification('Failed to update product');
          }
        });
      } else {
        this.productService.addProductWithImages(formData).subscribe({
          next: (res) => {
            this.dialogRef.close(res.data);
            this.showSuccessNotification('Product added successfully!');
          },
          error: (err) => {
            console.error('Error adding product:', err);
            this.showErrorNotification('Failed to add product');
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.productForm);
    }
  }
  private markFormGroupTouched(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched();
      } else if (control instanceof UntypedFormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  // ... (rest of your existing methods remain the same)
}