// form-dialog.component.ts
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { SliderService } from '../../slider.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Slider } from '../../slider.model';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '../../../../../../environments/environment';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

export interface DialogData {
  id: number;
  action: string;
  slider: Slider;
}

@Component({
  selector: 'app-slider-form-dialog',
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
    MatCheckboxModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDialogClose,
    CommonModule
  ]
})
export class SliderFormComponent implements OnInit {
  action: string;
  dialogTitle: string;
  sliderForm!: UntypedFormGroup;
  slider: Slider;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isUploading = false;
  isDragOver = false;
  apiUrl = environment.authApiBaseUrl;

  constructor(
    public dialogRef: MatDialogRef<SliderFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public sliderService: SliderService,
    private fb: UntypedFormBuilder,
  ) {
    this.action = data.action;
    this.dialogTitle = this.action === 'edit' ? `Edit ${data.slider.title}` : 'Add New Slider';
    this.slider = this.action === 'edit' ? data.slider : new Slider({});
    this.sliderForm = this.createSliderForm();
    
    // Set image preview for edit mode
    if (this.action === 'edit' && this.slider.image) {
      this.imagePreview = `assets${this.slider.image}`;
    }
  }

  ngOnInit(): void {}

  createSliderForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.slider.id],
      title: [this.slider.title],
      subtitle: [this.slider.subtitle],
      description: [this.slider.description],
      button_text: [this.slider.button_text],
      button_url: [this.slider.button_url],
      sort_order: [this.slider.sort_order || 0],
      is_active: [this.slider.is_active !== undefined ? this.slider.is_active : true],
      background_color: [this.slider.background_color],
      text_color: [this.slider.text_color]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.processFile(file);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  processFile(file: File): void {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.action === 'edit') {
      this.imagePreview = `${this.apiUrl}${this.slider.image}`;
    }
  }

  submit() {
    if (this.sliderForm.valid) {
      // Check if image is selected (for add) or exists (for edit)
      if (this.action === 'add' && !this.selectedFile) {
        alert('Please select an image');
        return;
      }

      this.isUploading = true;

      const formData = new FormData();
      
      // Append form data
      Object.keys(this.sliderForm.value).forEach(key => {
        if (this.sliderForm.value[key] !== null && this.sliderForm.value[key] !== undefined) {
          formData.append(key, this.sliderForm.value[key]);
        }
      });

      // Append image file if selected
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      if (this.action === 'edit') {
        this.sliderService.updateSlider(this.slider.id, formData).subscribe({
          next: (res) => {
            this.isUploading = false;
            this.dialogRef.close(res.data);
          },
          error: (err) => {
            console.error('Error updating slider:', err);
            this.isUploading = false;
            alert('Error updating slider: ' + (err.error?.message || 'Unknown error'));
          }
        });
      } else {
        this.sliderService.addSlider(formData).subscribe({
          next: (res) => {
            this.isUploading = false;
            this.dialogRef.close(res.data);
          },
          error: (err) => {
            console.error('Error adding slider:', err);
            this.isUploading = false;
            alert('Error adding slider: ' + (err.error?.message || 'Unknown error'));
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.sliderForm);
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