import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Page404Component } from '../authentication/page404/page404.component';

import { AllProductsComponent } from './product/allproduct/allproducts.component';
import { AllCategoriesComponent } from './categories/allcategories/allcategories.component';
import { AllOrdersComponent } from './orders/allorders/allorders.component';
import { AllCmsPageComponent } from './cmspage/allcmspage/allcmspage.component';
import { AllCouponsComponent } from './coupons/allcoupons/allcoupons.component';
import { AllBrandsComponent } from './brand/allbrand/allbrands.component';
import { AllCombosComponent } from './combo/allcombos/allcombos.component';
import { AllProductTypesComponent } from './producttype/allproducttypes/allproducttypes.component';
import { AllSlidersComponent } from './sliders/allsliders/allsliders.component';
export const SITEADMIN_ROUTE: Route[] = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'products',
    component: AllProductsComponent,
  },
  {
    path: 'categories',
    component: AllCategoriesComponent,
  },
  {
    path: 'brands',
    component: AllBrandsComponent,
  },
  {
    path: 'combo',
    component: AllCombosComponent,
  },
  {
    path: 'producttype',
    component: AllProductTypesComponent,
  },
  {
    path: 'orders',
    component: AllOrdersComponent,
  },
  {
    path: 'refunds',
    component: AllCategoriesComponent,
  },
  {
    path: 'customers',
    component: AllCategoriesComponent,
  },
  {
    path: 'coupons',
    component: AllCouponsComponent,
  },
   {
    path: 'sliders',
    component: AllSlidersComponent,
  },
  {
    path: 'freegifts',
    component: AllCategoriesComponent,
  },
  {
    path: 'cms',
    component: AllCmsPageComponent,
  },


  {
    path: 'pdf',
    component: AllCategoriesComponent,
  },
  {
    path: 'excel',
    component: AllCategoriesComponent,
  },

  { path: '**', component: Page404Component },
];

