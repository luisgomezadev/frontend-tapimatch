import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ErrorResponse } from '@core/interfaces/error-response';
import { AlertService } from '@core/services/alert.service';
import { PublicField } from '@features/field/interfaces/field';
import { FieldService } from '@features/field/services/field.service';
import {
  Reservation,
  ReservationDuration,
  ReservationRequest,
  TimeSlot
} from '@features/reservation/interfaces/reservation';
import { ReservationService } from '@features/reservation/services/reservation.service';
import { Venue } from '@features/venue/interfaces/venue';
import { VenueService } from '@features/venue/services/venue.service';
import { LoadingTextComponent } from '@shared/components/loading-text/loading-text.component';
import { CustomDatePipe } from '@shared/pipes/custom-date.pipe';
import { FieldTypePipe } from '@shared/pipes/field-type.pipe';
import { MoneyFormatPipe } from '@shared/pipes/money-format.pipe';
import { TimeFormatPipe } from '@shared/pipes/time-format.pipe';

interface DayItem {
  date: Date;
  formatted: string;
  weekday: string;
  dayNumber: number;
  monthName: string;
}

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    TimeFormatPipe,
    FieldTypePipe,
    MoneyFormatPipe,
    CustomDatePipe,
    LoadingTextComponent
  ],
  templateUrl: './reservation-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent implements OnInit {
  private readonly venueService = inject(VenueService);
  private readonly fieldService = inject(FieldService);
  private readonly reservationService = inject(ReservationService);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly alertService = inject(AlertService);

  venueCode = '';
  venue!: Venue;
  loading = signal<boolean>(false);
  loadingHours = signal<boolean>(false);
  loadingCreateReservation = signal<boolean>(false);
  selectedDate = signal<Date | null>(null);
  selectedDurationEnum = signal<ReservationDuration | null>(null);
  selectedMinutes = signal<number | null>(null);
  selectedStartTime = signal<string | null>(null);
  selectedField = signal<PublicField | null>(null);
  next20Days: DayItem[] = [];
  availableRanges: TimeSlot[] = [];
  availableStartTimes = signal<string[]>([]);
  reservationForm!: FormGroup;
  successReservation = false;
  reservationData!: Reservation;
  fields = signal<PublicField[]>([]);

  durations = [
    { enum: ReservationDuration.MIN_60, minutes: 60, label: '1 hora' },
    { enum: ReservationDuration.MIN_90, minutes: 90, label: '1 hora y media' },
    { enum: ReservationDuration.MIN_120, minutes: 120, label: '2 horas' },
    { enum: ReservationDuration.MIN_150, minutes: 150, label: '2 horas y media' },
    { enum: ReservationDuration.MIN_180, minutes: 180, label: '3 horas' }
  ];

  ngOnInit(): void {
    this.venueCode = this.route.snapshot.paramMap.get('code')!;
    this.getVenue();
    this.generateNext20Days();
    this.initForm();
  }

  initForm(): void {
    this.reservationForm = this.formBuilder.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      cellphone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });
  }

  generateNext20Days() {
    this.next20Days = [];
    const today = new Date();

    for (let i = 0; i < 20; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const weekday = d.toLocaleDateString('es-ES', { weekday: 'long' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('es-ES', { month: 'long' });

      this.next20Days.push({
        date: d,
        formatted: d.toISOString().split('T')[0],
        weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
        dayNumber,
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1)
      });
    }
  }

  selectDate(day: DayItem) {
    this.selectedDate.set(day.date);
    this.selectedStartTime.set(null);
    this.selectedMinutes.set(null);
    this.selectedField.set(null);
    this.selectedDurationEnum.set(null);
    this.reservationForm.reset();
  }

  selectField(field: PublicField) {
    this.selectedField.set(field);
    this.selectedStartTime.set(null);
    this.selectedMinutes.set(null);
    this.selectedDurationEnum.set(null);
    this.reservationForm.reset();
  }

  selectDuration(minutes: number) {
    this.selectedMinutes.set(minutes);
    this.selectedStartTime.set(null);
    this.reservationForm.reset();
  }

  getAvailableHours(minutes: number, enumValue: ReservationDuration) {
    this.selectedMinutes.set(minutes);
    this.selectedDurationEnum.set(enumValue);

    this.reservationForm.reset();
    this.selectedStartTime.set(null);

    this.loadingHours.set(true);

    if (!this.selectedDate() || !this.selectedField()) return;

    this.reservationService
      .getAvailableHours(
        this.venue.id,
        this.selectedField()!.id,
        this.formatDateLocal(this.selectedDate()!)
      )
      .subscribe(ranges => {
        this.loadingHours.set(false);
        this.availableRanges = ranges;
        this.generateStartTimes();
      });
  }

  generateStartTimes() {
    if (!this.availableRanges.length || !this.selectedMinutes()) {
      this.availableStartTimes.set([]);
      return;
    }

    const minutes = this.selectedMinutes();
    const step = 30; // intervalos de 30 min
    const slots: string[] = [];

    const now = new Date();
    const isToday =
      this.selectedDate() &&
      now.toISOString().split('T')[0] === this.selectedDate()!.toISOString().split('T')[0];

    this.availableRanges.forEach(r => {
      const startTime = this.parseTime(r.start);
      const endTime = this.parseTime(r.end);

      let current = new Date(startTime);
      const durationMs = minutes! * 60 * 1000;

      while (current.getTime() + durationMs <= endTime.getTime()) {
        if (!isToday || current.getTime() >= now.getTime()) {
          slots.push(this.formatTime(current));
        }

        current = new Date(current.getTime() + step * 60 * 1000);
      }
    });

    this.availableStartTimes.set(slots);
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseTime(timeStr: string): Date {
    const [h, m, s] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, s ?? 0, 0);
    return d;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  getVenue(): void {
    this.loading.set(true);
    this.venueService.getVenueByCode(this.venueCode).subscribe({
      next: data => {
        this.loading.set(false);
        this.venue = data;
        this.getFieldsByVenue(data.id);
      }
    });
  }

  getFieldsByVenue(venueId: number) {
    if (!this.venue) return;
    this.fieldService.getFieldsByVenueId(venueId).subscribe({
      next: fields => {
        this.fields.set(fields);
      },
      error: (err: ErrorResponse) => {
        this.alertService.error(
          'Error al obtener canchas',
          err.error.message || 'Error inesperado'
        );
      }
    });
  }

  onSubmit() {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      return;
    }

    this.loadingCreateReservation.set(true);

    const payload: ReservationRequest = {
      customerName: this.reservationForm.value.customerName,
      cellphone: this.reservationForm.value.cellphone,
      fieldId: this.selectedField()!.id,
      reservationDate: this.formatDateLocal(this.selectedDate()!),
      startTime: this.selectedStartTime()!,
      duration: this.selectedDurationEnum()!
    };

    this.reservationService.createReservation(payload).subscribe({
      next: data => {
        this.loadingCreateReservation.set(false);
        this.successReservation = true;
        this.reservationData = data;

        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: err => {
        this.loadingCreateReservation.set(false);
        this.alertService.error('Error', err.error?.message || 'Algo salió mal');
      }
    });
  }
}
