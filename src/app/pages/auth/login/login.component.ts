import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ErrorResponse } from '@core/interfaces/error-response';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingTextComponent } from '@shared/components/loading-text/loading-text.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    NavbarComponent,
    LoadingTextComponent,
    ButtonComponent
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  loginForm: FormGroup;
  loading = signal<boolean>(false);
  showPassword = false;

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    const { email, password } = this.loginForm.value;

    const handleError = (err: ErrorResponse) => {
      this.loading.set(false);
      this.alertService.error(
        'Error al iniciar sesión',
        err?.error?.message || 'Falló la autenticación'
      );
    };

    const handleSuccess = () => {
      this.loading.set(false);
      this.authService.redirectIfAuthenticated();
    };

    const loginObservable = this.authService.loginUser(email, password);

    loginObservable.subscribe({
      next: handleSuccess,
      error: handleError
    });
  }
}
