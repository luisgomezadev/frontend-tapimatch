import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ErrorResponse } from '@core/interfaces/error-response';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingTextComponent } from '@shared/components/loading-text/loading-text.component';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { REGEX_PATTERNS } from '@shared/utils/regex-utils';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    NavbarComponent,
    LoadingTextComponent,
    ButtonComponent
  ],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly alertService = inject(AlertService);

  registerForm: FormGroup;
  loading = signal<boolean>(false);
  showPassword = false;
  showConfirmPassword = false;

  constructor() {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        cellphone: ['', [Validators.required, Validators.pattern(REGEX_PATTERNS.cellphone)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(REGEX_PATTERNS.password)
          ]
        ],
        role: ['USER', Validators.required],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  passwordMatchValidator(formGroup: AbstractControl) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.registerForm.invalid || this.registerForm.hasError('passwordMismatch')) return;

    this.registerForm.removeControl('confirmPassword');

    const formData = this.registerForm.value;

    this.loading.set(true);

    const handleError = (err: ErrorResponse) => {
      this.loading.set(false);
      this.alertService.error('Error al registrar', err?.error?.message || 'Falló el registro');
    };

    const handleSuccess = () => {
      this.loading.set(false);
      this.alertService.success('Registro exitoso', 'Ahora puedes iniciar sesión');
      this.router.navigate(['/login']);
    };

    const loginObservable = this.authService.registerUser(formData);

    loginObservable.subscribe({
      next: handleSuccess,
      error: handleError
    });
  }
}
