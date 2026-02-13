import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/service/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="container py-5">
      <div class="row">
        <div class="col-lg-3">
            <!-- Sidebar Navigation (Placeholder for now, consistent with Order History) -->
            <div class="list-group">
                <a routerLink="/profile" class="list-group-item list-group-item-action active">Profile Info</a>
                <a routerLink="/my-orders" class="list-group-item list-group-item-action">My Orders</a>
                <button (click)="logout()" class="list-group-item list-group-item-action text-danger">Logout</button>
            </div>
        </div>
        <div class="col-lg-9">
          <h2 class="mb-4">Profile Information</h2>
          <div class="card shadow-sm">
            <div class="card-body">
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-control" formControlName="name">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-control" formControlName="email" readonly>
                  </div>
                   <div class="col-md-6">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" class="form-control" formControlName="phone">
                  </div>
                  <div class="col-12">
                    <label class="form-label">Address</label>
                    <textarea class="form-control" formControlName="address" rows="3"></textarea>
                  </div>
                </div>
                <div class="mt-4">
                  <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">
                    {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    isSubmitting = false;
    user: any;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private snackBar: MatSnackBar,
        private router: Router
    ) {
        this.profileForm = this.fb.group({
            name: ['', Validators.required],
            email: [''],
            phone: [''],
            address: ['']
        });
    }

    ngOnInit(): void {
        this.fetchProfile();
    }

    fetchProfile(): void {
        const localUser = this.authService.getDecodeToken();
        if (!localUser) {
            this.router.navigate(['/signin']);
            return;
        }

        // Call backend to get full details including phone/address which might not be in token
        this.authService.getProfile({ id: localUser.id }).subscribe({
            next: (res) => {
                if (res.success) {
                    this.user = res.data;
                    this.profileForm.patchValue({
                        name: this.user.name,
                        email: this.user.email,
                        phone: this.user.phone,
                        address: this.user.address
                    });
                }
            },
            error: (err) => console.error('Failed to load profile', err)
        });
    }

    updateProfile(): void {
        if (this.profileForm.invalid) return;

        this.isSubmitting = true;
        const formData = this.profileForm.value;

        // We need to pass ID to the backend
        const payload = { ...formData, id: this.user.id };

        this.authService.editProfile(payload).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                if (res.success) {
                    this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
                } else {
                    this.snackBar.open(res.message || 'Update failed', 'Close', { duration: 3000 });
                }
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error('Update failed', err);
                this.snackBar.open('An error occurred. Please try again.', 'Close', { duration: 3000 });
            }
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
