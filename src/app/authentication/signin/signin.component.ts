import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { AuthService, Role } from '@core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { environment } from 'environments/environment';

declare const google: any;
@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss'],
    imports: [
        RouterLink,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
         CommonModule,          // ✅ fix for *ngIf and *ngFor
         ReactiveFormsModule,   // for formGroup, formControlName
         MatFormFieldModule,
         MatInputModule,
         MatIconModule,
        MatButtonModule
    ]
})
export class SigninComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  timeLeft = 0;
  loading = false;
  timerInterval: any;
  otpSent = false;  error = '';
  hide = true;
  otpExpired=false;
loginMode: 'password' | 'otp' = 'password'; // default = username/password

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      otp: ['']
    });


    const token: any = this.authService.getDecodeToken();
    if(token != null && token != 'null')
      {
        if (token.role === 'Superuser') {
          this.router.navigate(['/siteadmin/dashboard']);
        } else {
          this.router.navigate(['/admin/dashboard/main']);
        }
      }
    
    // Initialize Google Sign-In
    this.initializeGoogleSignIn();
  }
  get f() {
    return this.authForm.controls;
  }
  adminSet() {
    this.router.navigate(['/admin/dashboard/main']);
  }
  doctorSet() {
 
  }
  patientSet() {
   
  }

 resendOtp() {
    if (!this.authForm.get('email')?.valid) return;

    this.loading = true;
    this.error = '';

    this.authService.sendOtp(this.authForm.value.email!).subscribe({
      next: (res) => {
        console.log("resendOtp", res);
        this.loading = false;

        if (res.success) {
          this.startTimer(60); // reset timer
        } else {
          this.error = res.message || 'Failed to resend OTP';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Server error while resending OTP';
      }
    });
  }
  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
startTimer(seconds: number) {
  if (this.timerInterval) clearInterval(this.timerInterval);
  this.timeLeft = seconds;
  this.otpExpired = false;  

  this.timerInterval = setInterval(() => {
    if (this.timeLeft > 0) {
      this.timeLeft--;
    } else {
      clearInterval(this.timerInterval);
      this.authForm.get('otp')?.reset();  

      // Mark as expired
      this.otpExpired = true;  
    }
  }, 1000);
}


sendOtp() {
  if (!this.authForm.get('email')?.valid) return;

  this.loading = true;
  this.error = '';

  this.authService.sendOtp(this.authForm.value.email!).subscribe({
    next: (res) => {
      this.loading = false;
      if (res.success) {
        this.otpSent = true;
        this.loginMode = 'otp';

        //  start countdown (e.g. 60 sec)
        this.startTimer(60);

        this.authForm.get('otp')?.setValidators([
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(6)
        ]);
        this.authForm.get('otp')?.updateValueAndValidity();
      } else {
        this.error = res.message || 'Failed to send OTP';
      }
    },
    error: () => {
      this.loading = false;
      this.error = 'Server error while sending OTP';
    }
  });
}

onSubmit(data: any) {
  this.error = '';

  //  CASE 1: Password + Username login
  if (this.loginMode === 'password') {
    this.loading = true;
    this.authService.login(data).subscribe({
      next: (res) => {
        console.log("errrrr",res)
        this.loading = false;

        if (res.success) {
          //  Logged in directly
          this.authService.storeToken(res.token);
          const token: any = this.authService.getDecodeToken();
          this.redirectBasedOnRole(token.role);
        } else if (res.message === 'Invalid OTP' || res.message === 'OTP expired') {
          // Backend expects OTP → switch mode
          this.loginMode = 'otp';
          this.error = res.message;
        } else {
          this.error = res.message || 'Login failed';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Server error. Please try again later.';
      }
    });
    return;
  }

  //  CASE 2: OTP login
  if (this.loginMode === 'otp') {
    if (this.otpExpired) {
      this.error = 'OTP expired. Please request a new one.';
      return;
    }
    if (!data.otp) {
      this.error = 'Please enter the OTP';
      return;
    }

    this.loading = true;
    this.authService.login(data).subscribe({
      next: (res) => {
        console.log("errrrr2222",res)

        this.loading = false;

        if (res.success) {
          this.authService.storeToken(res.token);
          const token: any = this.authService.getDecodeToken();
          this.redirectBasedOnRole(token.role);
        } else {
          this.error = res.message || 'Invalid OTP';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Server error during OTP verification';
      }
    });
  }
}


private redirectBasedOnRole(role: string) {
  if (role === 'Superuser') {
    this.router.navigate(['/siteadmin/dashboard']);
  } else {
    this.router.navigate(['/admin/dashboard/main']);
  }
}

initializeGoogleSignIn() {
  if (typeof google !== 'undefined') {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleGoogleSignIn.bind(this)
    });
    
    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { 
        theme: 'outline', 
        size: 'large',
        width: '100%',
        text: 'signin_with'
      }
    );
  }
}

handleGoogleSignIn(response: any) {
  this.loading = true;
  this.error = '';
  
  this.authService.googleSignIn(response.credential).subscribe({
    next: (res) => {
      this.loading = false;
      if (res.success) {
        this.authService.storeToken(res.token);
        const token: any = this.authService.getDecodeToken();
        this.redirectBasedOnRole(token.role);
      } else {
        this.error = res.message || 'Google sign-in failed';
      }
    },
    error: () => {
      this.loading = false;
      this.error = 'Server error during Google sign-in';
    }
  });
}

}
 
