import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { CouponService } from '../../coupon.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '@core/service/auth.service';
import { Router } from '@angular/router';

export interface DialogData {
  id: number;
  action: string;
  coupon: any;
}

@Component({
  selector: 'app-coupon-form-dialog',
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
    CommonModule
  ]
})
export class CouponFormDialogComponent implements OnInit {
  action: string;
  dialogTitle: string;
  couponForm!: UntypedFormGroup;
  coupon: any;
  token: any;
  today: Date = new Date();

  constructor(
    public dialogRef: MatDialogRef<CouponFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public couponService: CouponService,
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.action = data.action;
    this.dialogTitle = this.action === 'edit' ? `Edit ${data.coupon.code}` : 'Add New Coupon';
    this.coupon = this.action === 'edit' ? data.coupon : {};
    this.couponForm = this.createCouponForm();
  }

  ngOnInit(): void {
    this.token = this.authService.getDecodeToken();
    
    // Listen to type changes to show/hide max discount
    this.couponForm.get('type')?.valueChanges.subscribe(type => {
      if (type === 'percentage') {
        this.couponForm.get('max_discount')?.setValidators([Validators.min(0)]);
      } else {
        this.couponForm.get('max_discount')?.clearValidators();
      }
      this.couponForm.get('max_discount')?.updateValueAndValidity();
    });
  }

  createCouponForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.coupon.id],
      code: [this.coupon.code || '', [Validators.required, Validators.minLength(3)]],
      type: [this.coupon.type || 'percentage', [Validators.required]],
      value: [this.coupon.value || 0, [Validators.required, Validators.min(0)]],
      min_order_amount: [this.coupon.min_order_amount || 0, [Validators.min(0)]],
      max_discount: [this.coupon.max_discount || null, [Validators.min(0)]],
      usage_limit: [this.coupon.usage_limit || null, [Validators.min(1)]],
      valid_from: [this.coupon.valid_from || new Date(), [Validators.required]],
      valid_until: [this.coupon.valid_until || new Date(), [Validators.required]],
      status: [this.coupon.status !== undefined ? this.coupon.status : true, [Validators.required]],
    });
  }

  generateCode() {
    if (!this.couponForm.get('code')?.value) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.couponForm.patchValue({ code });
    }
  }

  submit() {
    if (this.couponForm.valid) {
      const formData = this.couponForm.value;
      
      // Convert dates to ISO string
      formData.valid_from = new Date(formData.valid_from).toISOString();
      formData.valid_until = new Date(formData.valid_until).toISOString();
      
      if (this.action === 'edit') {
        this.couponService.updateCoupon(formData).subscribe({
          next: (res) => {
            this.dialogRef.close(res.data);
            this.showSuccessNotification('Coupon updated successfully!');
          },
          error: (err) => {
            console.error('Error updating coupon:', err);
            this.showErrorNotification('Failed to update coupon');
          }
        });
      } else {
        this.couponService.addCoupon(formData).subscribe({
          next: (res) => {
            this.dialogRef.close(res.data);
            this.showSuccessNotification('Coupon added successfully!');
          },
          error: (err) => {
            console.error('Error adding coupon:', err);
            this.showErrorNotification('Failed to add coupon');
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.couponForm);
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

  private showSuccessNotification(message: string) {
    // You can implement snackbar notification here
    console.log('Success:', message);
  }

  private showErrorNotification(message: string) {
    // You can implement snackbar notification here
    console.error('Error:', message);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public confirmAdd(): void {
    this.submit();
  }

  // Get form control for template
  getFormControl(controlName: string): UntypedFormControl {
    return this.couponForm.get(controlName) as UntypedFormControl;
  }
}