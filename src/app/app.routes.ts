import { Route } from '@angular/router';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { AuthGuard } from '@core/guard/auth.guard';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { Page404Component } from './authentication/page404/page404.component';
import { Role } from '@core';
import { LandingComponent } from './landing/landing.component'; // 👈 import your new landing page
import { CatalogComponent } from './landing/catalog/catalog.component';
import { ProductDetailComponent } from './landing/product-detail/product-detail.component';
import { CmsComponent } from './landing/cms/cms.component';
import { SignInComponent } from './landing/customer/signin/signin.component';
import { SignUpComponent } from './landing/customer/signup/signup.component';
import { CartComponent } from './landing/cart/cart.component';
import { CheckoutComponent } from './landing/checkout/checkout.component';
import { OrderHistoryComponent } from './landing/customer/order-history/order-history.component';
import { OrderDetailComponent } from './landing/customer/order-history/order-detail.component';
import { ProfileComponent } from './landing/customer/profile/profile.component';
import { WishlistComponent } from './landing/customer/wishlist/wishlist.component';

export const APP_ROUTE: Route[] = [
    {
        path: '',
        component: LandingComponent,
    },
    {
        path: 'shop',
        component: CatalogComponent,
    },
    {
        path: 'shop-category',
        redirectTo: 'shop',
        pathMatch: 'full'
    },
    {
        path: 'shop-category/:id',
        component: CatalogComponent,
    },
    {
        path: 'product/:id',
        component: ProductDetailComponent,
    },

    {
        path: 'signin',
        component: SignInComponent,
    },
    {
        path: 'signup',
        component: SignUpComponent,
    },
    {
        path: 'cart',
        component: CartComponent,
    },
    {
        path: 'checkout',
        component: CheckoutComponent,
    },
    {
        path: 'my-orders',
        component: OrderHistoryComponent,
    },
    {
        path: 'orders/:id',
        component: OrderDetailComponent,
    },
    {
        path: 'profile',
        component: ProfileComponent,
    },
    {
        path: 'wishlist',
        component: WishlistComponent,
    },
    {
        path: 'cms/:id',
        component: CmsComponent,
    },
    {
        path: 'authentication',
        component: AuthLayoutComponent,
        loadChildren: () =>
            import('./authentication/auth.routes').then((m) => m.AUTH_ROUTE),
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'siteadmin',
                canActivate: [AuthGuard],
                data: { role: [Role.Superuser] },
                loadChildren: () =>
                    import('./siteadmin/siteadmin.routes').then((m) => m.SITEADMIN_ROUTE),
            },
        ],
    },
    { path: '**', component: Page404Component },
];
