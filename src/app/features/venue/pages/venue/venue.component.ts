import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, switchMap } from 'rxjs';
import { ErrorResponse } from '@core/interfaces/error-response';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { ScrollService } from '@core/services/scroll.service';
import { PublicField } from '@features/field/interfaces/field';
import { FieldService } from '@features/field/services/field.service';
import { Status, Venue, VenueRequest } from '@features/venue/interfaces/venue';
import { VenueService } from '@features/venue/services/venue.service';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { LoadingTextComponent } from '@shared/components/loading-text/loading-text.component';
import { MoneyFormatPipe } from '@shared/pipes/money-format.pipe';
import { TimeFormatPipe } from '@shared/pipes/time-format.pipe';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-venue',
  standalone: true,
  imports: [
    LayoutComponent,
    ReactiveFormsModule,
    LoadingTextComponent,
    TimeFormatPipe,
    MoneyFormatPipe,
    RouterModule
  ],
  templateUrl: './venue.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./venue.component.scss']
})
export class VenueComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly venueService = inject(VenueService);
  private readonly fieldService = inject(FieldService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  venueForm!: FormGroup;
  loading = signal<boolean>(false);
  venueData = signal<Venue | null>(null);
  fieldsData = signal<PublicField[]>([]);

  statusTypes = Object.values(Status);

  ngOnInit(): void {
    this.scrollService.scrollToTop();

    this.initForm();

    this.authService.currentUser$
      .pipe(
        switchMap(user => {
          if (!user) return EMPTY;
          return this.venueService.getMyVenue();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: venue => {
          if (venue) {
            this.venueData.set(venue);
            this.loadVenue(venue);
          }
        },
        error: (err: ErrorResponse) => {
          this.alertService.error(
            'Error al obtener complejo deportivo',
            err.error.message || 'Error inesperado'
          );
        }
      });
  }

  private initForm(): void {
    this.venueForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z0-9-]+$/)
        ]
      ],
      openingHour: ['', Validators.required],
      closingHour: ['', Validators.required]
    });
  }

  private loadVenue(venue: Venue): void {
    this.loadFields(venue.id);

    this.venueForm.patchValue({
      id: venue.id,
      name: venue.name,
      city: venue.city,
      address: venue.address,
      code: venue.code,
      openingHour: venue.openingHour,
      closingHour: venue.closingHour
    });
  }

  loadFields(venueId: number): void {
    this.fieldService.getFieldsByVenueId(venueId).subscribe({
      next: fields => {
        this.fieldsData.set(fields);
      },
      error: (err: ErrorResponse) => {
        this.alertService.error(
          'Error al obtener canchas',
          err.error.message || 'Error inesperado'
        );
      }
    });
  }

  onSubmit(): void {
    if (this.venueForm.invalid) {
      this.venueForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const formValue = this.venueForm.value;
    const venueId = formValue.id ? formValue.id : null;

    const request: VenueRequest = {
      name: formValue.name,
      code: formValue.code,
      city: formValue.city,
      address: formValue.address,
      openingHour: formValue.openingHour,
      closingHour: formValue.closingHour
    };
    if (venueId) {
      this.venueService.updateVenue(request, venueId).subscribe({
        next: res => {
          this.loading.set(false);
          this.venueData.set(res);
          this.loadFields(res.id);
          this.alertService.success(
            'Complejo deportivo actualizado',
            'La información de ' + res.name + ' ha sido actualizada.'
          );
        },
        error: (err: ErrorResponse) => {
          this.loading.set(false);
          this.alertService.error(
            'Error al actualizar complejo',
            err.error.message || 'Error inesperado'
          );
        }
      });
    } else {
      this.venueService.createVenue(request).subscribe({
        next: res => {
          this.loading.set(false);
          this.venueData.set(res);
          this.loadFields(res.id);
          this.alertService.success(
            'Complejo deportivo creado',
            res.name + ' registrado en el sistema, ahora puedes crear las canchas.'
          );
          this.venueForm.patchValue({ id: res.id });
        },
        error: (err: ErrorResponse) => {
          this.loading.set(false);
          this.alertService.error(
            'Error al registrar complejo',
            err.error.message || 'Error inesperado'
          );
        }
      });
    }
  }
}
