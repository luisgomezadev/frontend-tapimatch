import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { ErrorResponse } from '@core/interfaces/error-response';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { ScrollService } from '@core/services/scroll.service';
import { Reservation } from '@features/reservation/interfaces/reservation';
import { ReservationService } from '@features/reservation/services/reservation.service';
import { Venue } from '@features/venue/interfaces/venue';
import { VenueService } from '@features/venue/services/venue.service';
import { CreateVenueCardComponent } from '@shared/components/create-venue-card/create-venue-card.component';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { environment } from '@environments/environment';
import { User } from '@features/user/interfaces/user';
import { LoadingIconComponent } from '@shared/components/loading-icon/loading-icon.component';
import { HomeSkeletonComponent } from '@features/user/components/home-skeleton/home-skeleton.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    LayoutComponent,
    CreateVenueCardComponent,
    LoadingIconComponent,
    HomeSkeletonComponent
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly venueService = inject(VenueService);
  private readonly scrollService = inject(ScrollService);
  private readonly reservationService = inject(ReservationService);
  private readonly alertService = inject(AlertService);
  private readonly destroyRef = inject(DestroyRef);

  user = signal<User | null>(null);
  venue!: Venue;
  reservations!: Reservation[];
  loading = signal<boolean>(true);
  loadingReservations = signal<boolean>(true);
  copySuccess = signal<boolean>(false);
  countReservations = signal<number>(0);

  urlBase = environment.deploy + 'r/';
  link = '';

  ngOnInit(): void {
    this.scrollService.scrollToTop();

    this.authService.currentUser$
      .pipe(
        switchMap(user => {
          if (!user) {
            this.loading.set(false);
            this.loadingReservations.set(false);
            return EMPTY;
          }
          this.user.set(user);
          return this.venueService.getMyVenue();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: data => {
          if (data) {
            this.loading.set(false);
            this.venue = data;
            this.link = this.urlBase + this.venue.code;
            this.getCountReservationsToday();
          } else {
            this.loading.set(false);
            this.loadingReservations.set(false);
          }
        },
        error: (err: ErrorResponse) => {
          this.loading.set(false);
          this.loadingReservations.set(false);
          this.alertService.error(
            'Error al obtener complejo deportivo',
            err.error.message || 'Hubo un error inesperado'
          );
        }
      });
  }

  getCountReservationsToday(): void {
    const today = new Date();
    this.reservationService
      .countReservationsByVenueIdAndDate(this.venue.id, this.formatDateLocal(today))
      .subscribe({
        next: count => {
          this.countReservations.set(count);
          this.loadingReservations.set(false);
        },
        error: (err: ErrorResponse) => {
          this.loadingReservations.set(false);
          this.alertService.error(
            'Error al obtener el número de reservas',
            err.error.message || 'Hubo un error inesperado'
          );
        }
      });
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.link).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 1500);
    });
  }

  get whatsappUrl(): string {
    const text = encodeURIComponent(
      `¡Hola! puedes hacer tu reserva en ${this.venue.name} fácilmente desde este link: ${this.link}`
    );
    return `https://wa.me/?text=${text}`;
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
