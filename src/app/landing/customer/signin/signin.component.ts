import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartzillaService } from '../../../../themes/cartzilla/services/cartzilla.service';
import { AuthService } from '../../../core/service/auth.service';
import { environment } from 'environments/environment';

declare const google: any;

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SignInComponent implements OnInit, AfterViewInit, OnDestroy {

  signInForm: FormGroup;
  showPassword = false;
  submitted = false;
  loading = false;
  errorMessage = '';

  private themeLink?: HTMLLinkElement;
  private iconLink?: HTMLLinkElement;
  private scriptsLoaded = false;

  constructor(
    private fb: FormBuilder,
    private cartzillaService: CartzillaService,
    private authService: AuthService,
    private router: Router
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.signInForm.controls; }

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
  private showSuccessNotification(message: string) {
    console.log('Success:', message);
  }

  private showErrorNotification(message: string) {
    console.error('Error:', message);
  }
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.signInForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    console.log("ggg", this.signInForm.value);
    this.authService.login(this.signInForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.showSuccessNotification('Brand updated successfully!');
          this.redirectBasedOnUserType();
        } else {
          this.showErrorNotification('Login failed. Please try again.');
          this.errorMessage = response.message || 'Login failed. Please try again.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.showErrorNotification('An error occurred. Please try again.sss');
        this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  socialLogin(provider: string): void {
    console.log(`Social login with ${provider}`);
    // Implement actual social login logic here
    // For now, we'll simulate with a message
    this.errorMessage = `${provider} login is not implemented yet.`;
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
    this.errorMessage = '';
    
    this.authService.googleSignIn(response.credential).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.redirectBasedOnUserType();
        } else {
          this.errorMessage = res.message || 'Google sign-in failed';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Server error during Google sign-in';
      }
    });
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
    Object.keys(this.signInForm.controls).forEach(key => {
      const control = this.signInForm.get(key);
      control?.markAsTouched();
    });
  }

  // ... rest of the methods (loadCartzillaAssets, etc.) remain the same
  private loadCartzillaAssets(): void {
    // Your existing Cartzilla asset loading code
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