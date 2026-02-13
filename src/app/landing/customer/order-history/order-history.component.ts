import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/service/auth.service';
import { ReturnService } from './return.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5">
      <h2 class="mb-4">My Orders</h2>
      <div class="table-responsive" *ngIf="orders.length > 0; else noOrders">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td>{{ order.order_number }}</td>
              <td>{{ order.createdAt | date:'mediumDate' }}</td>
              <td>
                <span class="badge" 
                  [ngClass]="{
                    'bg-success': order.order_status === 'delivered',
                    'bg-primary': order.order_status === 'shipped',
                    'bg-warning': order.order_status === 'pending',
                    'bg-danger': order.order_status === 'cancelled',
                    'bg-info': order.order_status === 'return_requested'
                  }">
                  {{ order.order_status | titlecase }}
                </span>
              </td>
              <td>{{ order.final_amount | currency }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-2" (click)="viewOrder(order.id)">View</button>
                <button *ngIf="order.order_status === 'delivered'" 
                        class="btn btn-sm btn-outline-danger" 
                        (click)="requestReturn(order)">
                    Return
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #noOrders>
        <div class="alert alert-info">You have no orders yet.</div>
      </ng-template>
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private returnService: ReturnService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    const user = this.authService.getDecodeToken();
    if (!user) {
      this.loading = false;
      return;
    }

    this.http.get<any>(`${environment.orderApiBaseUrl}/user/${user.id}`)
      .subscribe({
        next: (res) => {
          this.orders = res.data || res; // Handle variations in response structure
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to fetch orders', err);
          this.loading = false;
        }
      });
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  requestReturn(order: any): void {
    const reason = prompt('Please enter the reason for return:');
    if (reason) {
      this.returnService.requestReturn({ order_id: order.id, reason }).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('Return requested successfully', 'Close', { duration: 3000 });
            // Update local state
            order.order_status = 'return_requested';
          } else {
            this.snackBar.open(res.message || 'Failed to request return', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          console.error('Return request failed', err);
          this.snackBar.open('Error requesting return', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
