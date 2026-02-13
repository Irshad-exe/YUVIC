import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { SidebarService } from 'app/layout/sidebar/sidebar.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getDecodeToken();

    if (!token) {
      this.router.navigate(['/authentication/signin']);
      return false;
    }

    const userRole = token.role;

    // we expect every route to have a `title` in its data property
    const menuTitle = route.data['title']; 
   

    return true;
  }
}
