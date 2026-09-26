import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { AlertService } from '@core/services/alert.service';
import { Reservation } from '@features/reservation/interfaces/reservation';
import { ReservationService } from '@features/reservation/services/reservation.service';
import { FormsModule } from '@angular/forms';
import { CustomDatePipe } from '@shared/pipes/custom-date.pipe';
import { TimeFormatPipe } from '@shared/pipes/time-format.pipe';
import { Router, RouterLink } from '@angular/router';
import { LoadingTextComponent } from '@shared/components/loading-text/loading-text.component';
import { ErrorResponse } from '@core/interfaces/error-response';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [FormsModule, CustomDatePipe, TimeFormatPipe, RouterLink, LoadingTextComponent],
  templateUrl: './reservation-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './reservation-detail.component.scss'
})
export class ReservationDetailComponent {
  private readonly reservationService = inject(ReservationService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  protected reservationData: Reservation | null = null;
  protected code = '';
  protected loading = signal<boolean>(false);
  protected CODE_LENGTH = 6;

  getReservationByCode(): void {
    this.loading.set(true);
    this.reservationData = null;
    this.reservationService.getReservationByCode(this.code).subscribe({
      next: data => {
        if (!data) {
          this.alertService.notify('', 'No se encontró ninguna reserva con ese código', 'warning');
          return;
        }
        this.reservationData = data;
      },
      error: (err: ErrorResponse) => {
        this.alertService.notify('', err.error.message || 'Ocurrió un error al buscar la reserva');
      },
      complete: () => this.loading.set(false)
    });
  }

  canceledReservation(): void {
    if (this.reservationData) {
      this.alertService
        .confirm(
          '¿Cancelar reserva?',
          '¿Estás seguro que deseas cancelar tu reserva?',
          'Sí, cancelar',
          'No'
        )
        .then(confirmed => {
          if (confirmed) {
            this.reservationService.canceledReservation(this.reservationData!.id).subscribe({
              next: () => {
                this.router.navigate(['/canchas']);
                this.alertService.success(
                  'Reserva cancelada',
                  'Has cancelado la reserva correctamente.'
                );
              }
            });
          }
        });
    }
  }
}
