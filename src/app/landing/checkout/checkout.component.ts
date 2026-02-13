import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from '../cart/cart.service';
import { Cart } from '../models/cart.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

declare var Razorpay: any;

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
    checkoutForm: FormGroup;
    cart$: Observable<Cart>;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private cartService: CartService,
        private http: HttpClient,
        private router: Router,
        private snackBar: MatSnackBar,
        private ngZone: NgZone
    ) {
        this.cart$ = this.cartService.cart$;
        this.checkoutForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            address: ['', Validators.required],
            city: ['', Validators.required],
            zipCode: ['', Validators.required],
            paymentMethod: ['cash_on_delivery', Validators.required]
        });
    }

    ngOnInit(): void { }

    get f() { return this.checkoutForm.controls; }

    placeOrder(): void {
        if (this.checkoutForm.invalid) return;

        this.isSubmitting = true;
        const formData = this.checkoutForm.value;

        if (formData.paymentMethod === 'online') {
            this.processOnlinePayment();
        } else {
            this.saveOrder(formData.paymentMethod);
        }
    }

    processOnlinePayment() {
        const cart = this.cartService.getCartValue();
        const amount = Math.round(cart.total); // Ensure integer

        this.http.post(`${environment.paymentApiBaseUrl}/create-order`, {
            amount: amount,
            currency: 'INR',
            receipt: 'order_receipt_' + new Date().getTime()
        }).subscribe({
            next: (order: any) => {
                this.initiateRazorpay(order);
            },
            error: (err) => {
                console.error('Error creating Razorpay order', err);
                this.snackBar.open('Error initiating payment', 'Close', { duration: 3000 });
                this.isSubmitting = false;
            }
        });
    }

    initiateRazorpay(order: any) {
        const options = {
            key: environment.razorpayKey,
            amount: order.amount,
            currency: order.currency,
            name: 'Yuvic Cosmetics',
            description: 'Order Payment',
            order_id: order.id,
            handler: (response: any) => {
                this.verifyPayment(response);
            },
            prefill: {
                name: this.checkoutForm.value.firstName + ' ' + this.checkoutForm.value.lastName,
                email: this.checkoutForm.value.email,
                contact: this.checkoutForm.value.phone
            },
            theme: {
                color: '#3399cc'
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
            console.error('Payment Failed', response.error);
            this.snackBar.open('Payment Failed. Please try again.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
        });
        rzp.open();
    }

    verifyPayment(response: any) {
        this.http.post(`${environment.paymentApiBaseUrl}/verify-payment`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
        }).subscribe({
            next: (res: any) => {
                this.ngZone.run(() => {
                    this.saveOrder('online', response.razorpay_payment_id);
                });
            },
            error: (err) => {
                console.error('Payment Verification Failed', err);
                this.snackBar.open('Payment Verification Failed', 'Close', { duration: 3000 });
                this.isSubmitting = false;
            }
        });
    }

    saveOrder(paymentMethod: string, transactionId: string = ''): void {
        const cart = this.cartService.getCartValue();
        const formData = this.checkoutForm.value;

        const orderPayload = {
            items: cart.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            })),
            shipping_address: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                zip_code: formData.zipCode
            },
            payment_method: paymentMethod,
            transaction_id: transactionId,
            subtotal: cart.subtotal,
            delivery_fee: cart.delivery_fee,
            total_amount: cart.total
        };

        // Assuming endpoint exists, adjust as needed based on authRoutes.js inspection
        this.http.post(`${environment.orderApiBaseUrl}`, orderPayload)
            .subscribe({
                next: (res: any) => {
                    this.cartService.clearCart();
                    this.snackBar.open('Order placed successfully!', 'Close', { duration: 5000 });
                    this.router.navigate(['/']); // Redirect to home or order confirmation
                },
                error: (err) => {
                    console.error('Order placement failed', err);
                    this.snackBar.open('Failed to place order. Please try again.', 'Close', { duration: 3000 });
                    this.isSubmitting = false;
                }
            });
    }
}
