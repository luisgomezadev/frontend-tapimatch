import { Component, inject, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { Venue } from '@features/venue/interfaces/venue';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { MoneyFormatPipe } from '@shared/pipes/money-format.pipe';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FieldTypeToPlayersPipe } from '@shared/pipes/fieldTypeToPlayers.pipe';
import { FieldService } from '@features/field/services/field.service';
import { PublicField } from '@features/field/interfaces/field';
import { AlertService } from '@core/services/alert.service';
import { ErrorResponse } from '@core/interfaces/error-response';
import { FieldCardSkeletonComponent } from '@features/field/components/field-card-skeleton/field-card-skeleton.component';

@Component({
  selector: 'app-venue-card',
  standalone: true,
  imports: [ModalComponent, MoneyFormatPipe, ButtonComponent, FieldTypeToPlayersPipe, FieldCardSkeletonComponent],
  templateUrl: './venue-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './venue-card.component.scss'
})
export class VenueCardComponent {
  private readonly router = inject(Router);
  private readonly fieldService = inject(FieldService);
  private readonly alertService = inject(AlertService);

  @Input() venue!: Venue;

  fields = signal([] as PublicField[]);

  loadingFields = signal(false);

  isOpen = signal(false);

  getFields() {
    this.fields.set([]);
    this.loadingFields.set(true);
    this.fieldService.getFieldsByVenueId(this.venue.id).subscribe({
      next: fields => {
        this.loadingFields.set(false);
        this.fields.set(fields);
      },
      error: (err: ErrorResponse) => {
        this.loadingFields.set(false);
        this.alertService.error(
          'Error al obtener canchas',
          err.error.message || 'Hubo un error inesperado'
        );
      }
    });
  }

  openModal(): void {
    this.getFields();
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  onClosed() {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  goToReservation(): void {
    if (!this.venue.hasFields) {
      this.alertService.notify(
        'No hay canchas disponibles',
        'Este lugar no tiene canchas disponibles para reservar',
        'warning'
      );
      return;
    }
    this.onClosed();
    this.router.navigate(['/r/' + this.venue.code]);
  }
}
