// form-dialog.component.ts
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ComboService } from '../../combo.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Combo, ComboProduct } from '../../combo.model';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface DialogData {
  id: number;
  action: string;
  combo: Combo;
}

@Component({
  selector: 'app-combo-form-dialog',
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
    MatDialogClose,
    CommonModule
  ]
})
export class ComboFormComponent implements OnInit {
  action: string;
  dialogTitle: string;
  comboForm!: UntypedFormGroup;
  combo: Combo;
  products: any[] = [];
  isLoading = false;
  totalOriginalPrice = 0;

  constructor(
    public dialogRef: MatDialogRef<ComboFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public comboService: ComboService,
    private fb: UntypedFormBuilder,
  ) {
    this.action = data.action;
    this.dialogTitle = this.action === 'edit' ? `Edit ${data.combo.name}` : 'Add New Combo';
    this.combo = this.action === 'edit' ? data.combo : new Combo({});
    this.comboForm = this.createComboForm();
  }

  ngOnInit(): void {
    
  }

  createComboForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.combo.id],
      name: [this.combo.name, [Validators.required, Validators.minLength(2)]],
      discount_price: [this.combo.discount_price, [Validators.required, Validators.min(0)]],
      active: [this.combo.active !== undefined ? this.combo.active : true],
      combo_size: [this.combo.combo_size, [Validators.required, Validators.min(1)]]});
  }

  


  
  submit() {
    if (this.comboForm.valid) {
      const formData = this.comboForm.value;
      
      // Filter out empty product entries
  
      if (this.action === 'edit') {
        this.comboService.updateCombo(formData).subscribe({
          next: (res) => {
            this.dialogRef.close(res.data);
          },
          error: (err) => {
            console.error('Error updating combo:', err);
            alert('Error updating combo: ' + err.error.message);
          }
        });
      } else {
        this.comboService.addCombo(formData).subscribe({
          next: (res) => {
            this.dialogRef.close(res.data);
          },
          error: (err) => {
            console.error('Error adding combo:', err);
            alert('Error adding combo: ' + err.error.message);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.comboForm);
      alert('Please fill all required fields correctly');
    }
  }

  private markFormGroupTouched(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched();
      } else if (control instanceof UntypedFormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(group => {
          if (group instanceof UntypedFormGroup) {
            this.markFormGroupTouched(group);
          }
        });
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}