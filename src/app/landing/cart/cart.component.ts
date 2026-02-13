import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from './cart.service';
import { Cart, CartItem } from '../models/cart.model';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
    cart$: Observable<Cart>;

    constructor(private cartService: CartService) {
        this.cart$ = this.cartService.cart$;
    }

    ngOnInit(): void { }

    incrementItem(item: CartItem): void {
        this.cartService.updateQuantity(item.product_id, item.quantity + 1);
    }

    decrementItem(item: CartItem): void {
        this.cartService.updateQuantity(item.product_id, item.quantity - 1);
    }

    removeItem(productId: string): void {
        this.cartService.removeFromCart(productId);
    }

    clearCart(): void {
        this.cartService.clearCart();
    }
}
