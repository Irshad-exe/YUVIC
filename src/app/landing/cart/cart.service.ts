import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartSubject = new BehaviorSubject<Cart>({
        items: [],
        subtotal: 0,
        total_items: 0,
        delivery_fee: 0,
        total: 0,
        free_delivery_threshold: 100 // Example threshold
    });

    cart$ = this.cartSubject.asObservable();
    private readonly STORAGE_KEY = 'cart';

    constructor(private snackBar: MatSnackBar) {
        this.loadCart();
    }

    getCartValue(): Cart {
        return this.cartSubject.value;
    }

    addToCart(product: any, quantity: number = 1): void {
        const currentCart = this.getCartValue();
        const existingItemIndex = currentCart.items.findIndex(item => item.product_id === product.id);

        if (existingItemIndex > -1) {
            currentCart.items[existingItemIndex].quantity += quantity;
            currentCart.items[existingItemIndex].total =
                currentCart.items[existingItemIndex].price * currentCart.items[existingItemIndex].quantity;
        } else {
            let image = 'assets/img/no-image.png';
            if (product.images && product.images.length > 0) {
                const firstImage = product.images[0];
                if (typeof firstImage === 'string') {
                    image = firstImage;
                } else if (firstImage && firstImage.filename) {
                    image = 'assets/uploads/products/' + firstImage.filename;
                }
            }

            const newItem: CartItem = {
                id: Date.now().toString(), // Temporary ID
                product_id: product.id,
                product_name: product.name,
                product_image: image,
                price: parseFloat(product.price),
                quantity: quantity,
                total: parseFloat(product.price) * quantity
            };
            currentCart.items.push(newItem);
        }

        this.updateCartState(currentCart);
        this.snackBar.open('Product added to cart', 'Close', { duration: 3000 });
    }

    removeFromCart(productId: string): void {
        const currentCart = this.getCartValue();
        const updatedItems = currentCart.items.filter(item => item.product_id !== productId);

        currentCart.items = updatedItems;
        this.updateCartState(currentCart);
    }

    updateQuantity(productId: string, quantity: number): void {
        const currentCart = this.getCartValue();
        const itemIndex = currentCart.items.findIndex(item => item.product_id === productId);

        if (itemIndex > -1) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            currentCart.items[itemIndex].quantity = quantity;
            currentCart.items[itemIndex].total = currentCart.items[itemIndex].price * quantity;
            this.updateCartState(currentCart);
        }
    }

    clearCart(): void {
        const emptyCart: Cart = {
            items: [],
            subtotal: 0,
            total_items: 0,
            delivery_fee: 0,
            total: 0,
            free_delivery_threshold: 100
        };
        this.updateCartState(emptyCart);
    }

    private updateCartState(cart: Cart): void {
        cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
        cart.total_items = cart.items.reduce((count, item) => count + item.quantity, 0);
        cart.delivery_fee = cart.subtotal > cart.free_delivery_threshold ? 0 : 10; // Example logic
        cart.total = cart.subtotal + cart.delivery_fee;

        this.cartSubject.next(cart);
        this.saveCart(cart);
    }

    private saveCart(cart: Cart): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    }

    private loadCart(): void {
        const savedCart = localStorage.getItem(this.STORAGE_KEY);
        if (savedCart) {
            try {
                const parsedCart: Cart = JSON.parse(savedCart);
                this.cartSubject.next(parsedCart);
            } catch (e) {
                console.error('Failed to load cart from storage', e);
            }
        }
    }
}
