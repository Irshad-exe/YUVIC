import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/service/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private apiUrl = `${environment.authApiBaseUrl}/wishlist`;
    private wishlistSubject = new BehaviorSubject<any[]>([]);
    wishlist$ = this.wishlistSubject.asObservable();

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {
        // Load wishlist immediately if user is logged in
        const user = this.authService.getDecodeToken();
        if (user) {
            this.loadWishlist();
        }
        
        // Also reload when user changes (login/logout)
        this.authService.currentUser$.subscribe((user: any) => {
            if (user) {
                this.loadWishlist();
            } else if (!this.authService.isAuthenticated()) {
                this.wishlistSubject.next([]);
            }
        });
    }

    loadWishlist(): void {
        const user = this.authService.getDecodeToken();
        if (!user) return;

        this.http.get<any>(`${this.apiUrl}/user/${user.id}`).subscribe({
            next: (res) => {
                const items = res.success ? res.data : [];
                this.wishlistSubject.next(items);
            },
            error: (err) => console.error('Error loading wishlist', err)
        });
    }

    addToWishlist(productId: string): void {
        const user = this.authService.getDecodeToken();
        if (!user) {
            this.snackBar.open('Please login to use wishlist', 'Close', { duration: 3000 });
            return;
        }

        this.http.post<any>(this.apiUrl, { user_id: user.id, product_id: productId }).subscribe({
            next: (res) => {
                if (res.success) {
                    this.snackBar.open('Added to wishlist', 'Close', { duration: 2000 });
                    this.loadWishlist(); // Reload
                } else {
                    this.snackBar.open(res.message || 'Failed to add', 'Close', { duration: 2000 });
                }
            },
            error: (err) => {
                this.snackBar.open('Error adding to wishlist', 'Close', { duration: 2000 });
            }
        });
    }

    removeFromWishlist(id: string): void {
        this.http.delete<any>(`${this.apiUrl}/${id}`).subscribe({
            next: (res) => {
                if (res.success) {
                    const current = this.wishlistSubject.value.filter(item => item.id !== id);
                    this.wishlistSubject.next(current);
                    this.snackBar.open('Removed from wishlist', 'Close', { duration: 2000 });
                }
            }
        });
    }
}
