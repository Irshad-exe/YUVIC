import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CartzillaService } from '../../../../themes/cartzilla/services/cartzilla.service';
import { AuthService } from '../../../core/service/auth.service';
import { environment } from 'environments/environment';

declare const google: any;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignUpComponent implements OnInit, AfterViewInit, OnDestroy {

  signUpForm: FormGroup;
  showPassword = false;
  submitted = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  private themeLink?: HTMLLinkElement;
  private iconLink?: HTMLLinkElement;
  private scriptsLoaded = false;

  constructor(
    private fb: FormBuilder,
    private cartzillaService: CartzillaService,
    private authService: AuthService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      address: [''],
      savePassword: [false],
      privacyPolicy: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.signUpForm.controls; }

  ngOnInit(): void {
    this.loadCartzillaAssets();

    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnUserType();
    }
    
    // Initialize Google Sign-In
    setTimeout(() => this.initializeGoogleSignIn(), 1000);
  }

  ngAfterViewInit(): void {
    this.initializeWhenReady();
  }

  ngOnDestroy(): void {
    this.removeDynamicAssets();
  }

  // Custom validator for password match
  passwordMatchValidator(control: AbstractControl): null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      // Clear the error if passwords match
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    
    return null;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.signUpForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;

    // Prepare user data
    const userData = {
      name: this.signUpForm.value.name,
      email: this.signUpForm.value.email,
      password: this.signUpForm.value.password,
      address: this.signUpForm.value.address,
      user_type: 'customer' // Always set as customer for signup
    };
    console.log("usera", userData)
    this.authService.signUp(userData).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = response.message || 'Account created successfully!';
          // Auto login after successful signup
          if (response.token && response.user) {
            setTimeout(() => {
              this.redirectBasedOnUserType();
            }, 2000);
          } else {
            // Redirect to login page
            setTimeout(() => {
              this.router.navigate(['/signin']);
            }, 2000);
          }
        } else {
          this.errorMessage = response.message || 'Registration failed. Please try again.';
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  socialLogin(provider: string): void {
    console.log(`Social login with ${provider}`);
    this.errorMessage = `${provider} login is not implemented yet.`;
  }

  initializeGoogleSignIn() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleGoogleSignIn.bind(this)
      });
      
      google.accounts.id.renderButton(
        document.getElementById('google-signup-button'),
        { 
          theme: 'outline', 
          size: 'large',
          width: '100%',
          text: 'signup_with'
        }
      );
    }
  }

  handleGoogleSignIn(response: any) {
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.googleSignIn(response.credential).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMessage = 'Signed up successfully with Google!';
          setTimeout(() => {
            this.redirectBasedOnUserType();
          }, 1500);
        } else {
          this.errorMessage = res.message || 'Google sign-up failed';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Server error during Google sign-up';
      }
    });
  }

  openBenefits(): void {
    // This will be handled by Cartzilla's offcanvas
    const benefitsOffcanvas = document.getElementById('benefits');
    if (benefitsOffcanvas) {
      // Cartzilla will handle the offcanvas toggle
    }
  }

  private redirectBasedOnUserType(): void {
    const user = this.authService.getCurrentUser();
    if (user?.user_type === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signUpForm.controls).forEach(key => {
      const control = this.signUpForm.get(key);
      control?.markAsTouched();
    });
  }

  // ... rest of the methods (loadCartzillaAssets, etc.) remain the same as in signin
  private loadCartzillaAssets(): void {
    this.themeLink = document.createElement('link');
    this.themeLink.rel = 'stylesheet';
    this.themeLink.href = 'assets/cartzilla/css/theme.min.css';
    document.head.appendChild(this.themeLink);

    this.iconLink = document.createElement('link');
    this.iconLink.rel = 'stylesheet';
    this.iconLink.href = 'assets/cartzilla/icons/cartzilla-icons.min.css';
    document.head.appendChild(this.iconLink);

    this.loadJavaScriptAssets().then(() => {
      this.scriptsLoaded = true;
      this.initializeCartzilla();
    });
  }

  private loadJavaScriptAssets(): Promise<void> {
    return new Promise((resolve) => {
      const scriptsToLoad = [
        'assets/cartzilla/js/theme.min.js',
        'assets/cartzilla/js/theme-switcher.js'
      ];

      this.loadScriptsSequentially(scriptsToLoad, resolve);
    });
  }

  private loadScriptsSequentially(scripts: string[], callback: () => void): void {
    let index = 0;

    const loadNextScript = () => {
      if (index >= scripts.length) {
        callback();
        return;
      }

      const script = document.createElement('script');
      script.src = scripts[index];
      script.onload = () => {
        index++;
        loadNextScript();
      };
      script.onerror = () => {
        console.error(`Failed to load script: ${scripts[index]}`);
        index++;
        loadNextScript();
      };
      document.head.appendChild(script);
    };

    loadNextScript();
  }

  private initializeWhenReady(): void {
    const maxWaitTime = 5000;
    const startTime = Date.now();

    const checkAndInitialize = () => {
      if (this.scriptsLoaded) {
        this.initializeCartzilla();
        return;
      }

      if (Date.now() - startTime < maxWaitTime) {
        setTimeout(checkAndInitialize, 100);
      } else {
        console.warn('Scripts loading timeout, initializing anyway');
        this.initializeCartzilla();
      }
    };

    checkAndInitialize();
  }

  private initializeCartzilla(): void {
    setTimeout(() => {
      this.cartzillaService.initializeCartzilla();
      this.initializeFormValidation();
    }, 300);
  }

  private initializeFormValidation(): void {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach((form: any) => {
      form.addEventListener('submit', (event: Event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }

  private removeDynamicAssets(): void {
    [this.themeLink, this.iconLink].forEach(asset => {
      if (asset && asset.parentNode) {
        asset.parentNode.removeChild(asset);
      }
    });

    const dynamicScripts = document.querySelectorAll('script[src*="cartzilla"]');
    dynamicScripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
  }
}