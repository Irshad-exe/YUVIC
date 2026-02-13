import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService } from './review.service';
import { AuthService } from '../../../../core/service/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-product-reviews',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="row pt-2 pt-md-3">
      <div class="col-md-7">
        <h3 class="h4 mb-4">Reviews ({{ reviews.length }})</h3>
        
        <!-- Review List -->
        <div class="mb-4 pb-4 border-bottom" *ngFor="let review of reviews">
            <div class="d-flex justify-content-between mb-2">
                <div class="d-flex align-items-center">
                    <!-- Avatar placeholder -->
                    <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style="width: 40px; height: 40px; font-weight: bold;">
                        {{ review.user?.name?.charAt(0) || 'U' }}
                    </div>
                    <div>
                        <h6 class="mb-0">{{ review.user?.name || 'User' }}</h6>
                        <span class="fs-xs text-muted">{{ review.createdAt | date }}</span>
                    </div>
                </div>
                <div class="star-rating">
                   <ng-container *ngFor="let star of [1,2,3,4,5]">
                        <i class="ci-star-filled text-warning" *ngIf="star <= review.rating"></i>
                        <i class="ci-star text-muted" *ngIf="star > review.rating"></i>
                   </ng-container>
                </div>
            </div>
            <p class="fs-sm">{{ review.comment }}</p>
        </div>

        <div *ngIf="reviews.length === 0" class="alert alert-secondary mb-4">
            No reviews yet. Be the first to review!
        </div>

        <!-- Add Review Form -->
        <h4 class="h5 mb-3">Write a review</h4>
        <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" *ngIf="isLoggedIn; else loginPrompt">
            <div class="mb-3">
                <label class="form-label">Rating</label>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-outline-secondary btn-sm" 
                        *ngFor="let star of [1,2,3,4,5]" 
                        [class.active]="reviewForm.get('rating')?.value === star"
                        [class.btn-warning]="reviewForm.get('rating')?.value >= star"
                        (click)="setRating(star)">
                        <i class="ci-star"></i> {{star}}
                    </button>
                </div>
                <div *ngIf="submitted && reviewForm.get('rating')?.hasError('required')" class="text-danger fs-sm mt-1">
                    Please select a rating
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label" for="review-text">Review</label>
                <textarea class="form-control" id="review-text" rows="4" formControlName="comment" placeholder="Your review..."></textarea>
                <div *ngIf="submitted && reviewForm.get('comment')?.hasError('required')" class="text-danger fs-sm mt-1">
                    Please write a comment
                </div>
            </div>
            <button type="submit" class="btn btn-primary rounded-pill" [disabled]="isSubmitting">Submit Review</button>
        </form>

        <ng-template #loginPrompt>
            <div class="alert alert-info">
                Please <a href="/signin">sign in</a> to leave a review.
            </div>
        </ng-template>

      </div>
    </div>
  `
})
export class ProductReviewsComponent implements OnInit {
    @Input() productId!: number | string;
    reviews: any[] = [];
    reviewForm: FormGroup;
    isLoggedIn = false;
    isSubmitting = false;
    submitted = false;

    constructor(
        private reviewService: ReviewService,
        private authService: AuthService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {
        this.reviewForm = this.fb.group({
            rating: [5, Validators.required],
            comment: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        if (this.productId) {
            this.loadReviews();
        }
        this.isLoggedIn = this.authService.isLoggedIn();
    }

    loadReviews(): void {
        this.reviewService.getReviews(this.productId).subscribe({
            next: (res) => {
                if (res.success) {
                    this.reviews = res.data;
                }
            }
        });
    }

    setRating(rating: number): void {
        this.reviewForm.patchValue({ rating });
    }

    submitReview(): void {
        this.submitted = true;
        if (this.reviewForm.invalid) return;

        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.isSubmitting = true;
        const payload = {
            user_id: user.id || user.user_id, // flexible ID check
            product_id: Number(this.productId),
            rating: this.reviewForm.value.rating,
            comment: this.reviewForm.value.comment
        };

        this.reviewService.addReview(payload).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                if (res.success) {
                    this.snackBar.open('Review submitted!', 'Close', { duration: 3000 });
                    this.reviews.unshift(res.data); // Add to top
                    // Add fake user for immediate display if needed, or reload
                    this.reviewForm.reset({ rating: 5 });
                    this.submitted = false;
                    this.loadReviews();
                } else {
                    this.snackBar.open(res.message || 'Error', 'Close', { duration: 3000 });
                }
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error(err);
                this.snackBar.open('Failed to submit review', 'Close', { duration: 3000 });
            }
        });
    }
}
