import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { CategoryService } from '../../category.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Category } from '../../category.model';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

export interface DialogData {
  id: number;
  action: string;
  category: Category;
}

@Component({
  selector: 'app-category-form-dialog',
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
    MatDialogClose,
    CommonModule
  ]
})
export class CategoryFormComponent implements OnInit {
  action: string;
  dialogTitle: string;
  categoryForm!: UntypedFormGroup;
  category: Category;
  parentCategories: any[] = [];
  allCategories: any[] = [];
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<CategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public categoryService: CategoryService,
    private fb: UntypedFormBuilder,
  ) {
    this.action = data.action;
    this.dialogTitle = this.action === 'edit' ? `Edit ${data.category.name}` : 'Add New Category';
    this.category = this.action === 'edit' ? data.category : new Category({});
    this.categoryForm = this.createCategoryForm();
  }

  ngOnInit(): void {
    this.loadParentCategories();
    
    // For edit mode, exclude current category and its children from parent options
    if (this.action === 'edit') {
      this.loadAllCategories();
    }
  }

  createCategoryForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.category.id],
      name: [this.category.name, [Validators.required, Validators.minLength(2)]],
      slug: [this.category.slug, [Validators.required]],
      description: [this.category.description],
      image_url: [this.category.image_url],
      status: [this.category.status !== undefined ? this.category.status : true, [Validators.required]],
      parent_id: [this.category.parent_id || null],
      is_featured: [this.category.is_featured || false],
      sort_order: [this.category.sort_order || 0],
      meta_title: [this.category.meta_title],
      meta_description: [this.category.meta_description],
      created_by: [this.category.created_by || 'system'],
      updated_by: [this.category.updated_by || 'system']
    });
  }

  loadParentCategories(): void {
    this.isLoading = true;
    this.categoryService.getParentCategories().subscribe({
      next: (res) => {
        this.parentCategories = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading parent categories:', err);
        this.isLoading = false;
      }
    });
  }

  loadAllCategories(): void {
    this.categoryService.getCategoriesForDropdown().subscribe({
      next: (res) => {
        this.allCategories = res.data;
        // Filter out current category and its potential children from parent options
        this.parentCategories = this.allCategories.filter(cat => 
          cat.id !== this.category.id && cat.parent_id !== this.category.id
        );
      },
      error: (err) => {
        console.error('Error loading all categories:', err);
      }
    });
  }

  // Helper method to get parent category name for display
  getParentCategoryName(parentId: string): string {
    if (!parentId) return 'None';
    const parent = this.allCategories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Unknown';
  }

  submit() {
    if (this.categoryForm.valid) {
      const formData = this.categoryForm.value;
      
      // Convert empty string to null for parent_id
      if (formData.parent_id === '') {
        formData.parent_id = null;
      }
      
      if (this.action === 'edit') {
        this.categoryService.updateCategory(formData).subscribe({
          next: (res) => {
            this.dialogRef.close(res.data);
          },
          error: (err) => {
            console.error('Error updating category:', err);
          }
        });
      } else {
        this.categoryService.addCategory(formData).subscribe({
          next: (res) => {
            this.dialogRef.close(res.data);
          },
          error: (err) => {
            console.error('Error adding category:', err);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.categoryForm);
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

  onNoClick(): void {
    this.dialogRef.close();
  }
}