import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import { Role } from '@core/models/role';
import { map, tap } from 'rxjs/operators';
//import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';


interface AppUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  module_id: number;
  action_id: number;
  key: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private currentUserSubject: BehaviorSubject<User>;
  // public currentUser: Observable<User>;
  private readonly apiUrl = environment.authApiBaseUrl;
  private tokenKey = 'authToken';
  private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  customLabelSetting: any;

  // private users = [
  //   {
  //     id: 1,
  //     img: 'assets/images/user/admin.jpg',
  //     username: 'admin@hospital.org',
  //     password: 'admin@123',
  //     firstName: 'Sarah',
  //     lastName: 'Smith',
  //     role: Role.Admin,
  //     token: 'admin-token',
  //   },
  //   {
  //     id: 2,
  //     img: 'assets/images/user/doctor.jpg',
  //     username: 'doctor@hospital.org',
  //     password: 'doctor@123',
  //     firstName: 'Ashton',
  //     lastName: 'Cox',
  //     role: Role.Doctor,
  //     token: 'doctor-token',
  //   },
  //   {
  //     id: 3,
  //     img: 'assets/images/user/patient.jpg',
  //     username: 'patient@hospital.org',
  //     password: 'patient@123',
  //     firstName: 'Cara',
  //     lastName: 'Stevens',
  //     role: Role.Patient,
  //     token: 'patient-token',
  //   },
  // ];

  constructor(private http: HttpClient) {

  }

  // public get currentUserValue(): User {
  //   return this.currentUserSubject.value;
  // }

  // login(data:any): Observable<any> {
  //   console.log('dataservice61',data);

  //   return this.http.post<any>(`${this.apiUrl}/login`,data);
  // }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.storeToken(response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  signUp(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, userData).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.storeToken(response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  googleSignIn(credential: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/google-signin`, { credential }).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.storeToken(response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
  sendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-otp`, { email });
  }

  verifyOtp(data: { email: string; otp: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, data);
  }

  updateToken(groupId: number, hospitalId: number, oldToken: string,): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/updateToken`, {
      oldToken: oldToken, // The raw token string
      selected_group_id: groupId,
      selected_hospital_id: hospitalId
    });
  }
  updateTokenForDispensory(hospitalId: number, oldToken: string,): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/updateTokenForDispensory`, {
      oldToken: oldToken, // The raw token string
      selected_hospital_id: hospitalId
    });
  }
  storeToken(token: string): void {
    console.log('token21', token);
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getDecodeToken(): any {
    // const token = localStorage.getItem('authToken');
    //console.log('Raw token:', token);
    const token = this.getToken();
    if (!token) return null;

    try {
      const payloadBase64Url = token.split('.')[1];
      if (!payloadBase64Url) throw new Error('Invalid token format');

      const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = payloadBase64.padEnd(payloadBase64.length + (4 - payloadBase64.length % 4) % 4, '=');

      const payloadJson = atob(padded);
      console.log('Decoded payload:', payloadJson);
      return JSON.parse(payloadJson);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  getProfile(data: any): Observable<any> {
    console.log('dataservice61111', data);

    return this.http.post<any>(`${this.apiUrl}/getProfile`, data);
  }

  editProfile(data: any): Observable<any> {
    console.log('dataservice61111', data);
    return this.http.post<any>(`${this.apiUrl}/editProfile`, data);
  }
  error(message: string) {
    return throwError(message);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value || this.getDecodeToken();
  }
  getCurrentUserPermissions(): Permission[] {
    const user = this.currentUserSubject.value;
    console.log('Current user:', user);
    if (user?.permissions) {
      return user.permissions;
    }

    const decoded = this.getDecodeToken();
    if (!decoded?.permissions) return [];

    return decoded.permissions.map((key: string) => {
      const [module_id, action_id] = key.split('_').map(Number);
      return { key, module_id, action_id, id: 0 };
    });
  }

  hasPermission(moduleId: number, actionId: number): boolean {
    const permissions = this.getCurrentUserPermissions();
    console.log('10Checking permissions:', permissions);
    console.log('10Module ID:', moduleId, 'Action ID:', actionId);
    return permissions.some(p =>
      p.module_id === moduleId && p.action_id === actionId
    );
  }
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem(this.tokenKey);
    // this.currentUserSubject.next(this.currentUserValue);
    return of({ success: false });
  }


}
