import { Service, computed, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Field, FieldRequest, PublicField } from '@field/interfaces/field';
import { BaseHttpService } from '@shared/data-access/base-http.service';

@Service()
export class FieldService extends BaseHttpService {
  private readonly ENDPOINT = this.apiUrl + '/field';

  private fieldsSignal = signal<Field[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  fields = this.fieldsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  totalFields = computed(() => this.fieldsSignal().length);
  activeFields = computed(() => this.fieldsSignal().filter(f => f.active));

  getFieldsByVenueId(venueId: number): Observable<PublicField[]> {
    return this.http.get<PublicField[]>(`${this.ENDPOINT}/p/${venueId}`);
  }

  getAllFieldsByVenueId(): Observable<Field[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<Field[]>(`${this.ENDPOINT}`).pipe(
      tap((fields) => {
        this.fieldsSignal.set(fields);
        this.loadingSignal.set(false);
      }),
      catchError((err) => this.handleError(err))
    );
  }

  createField(field: FieldRequest): Observable<Field> {
    return this.http.post<Field>(`${this.ENDPOINT}`, field).pipe(
      tap((created) => {
        this.fieldsSignal.update((current) => [created, ...current]);
      }),
      catchError((err) => this.handleError(err))
    );
  }

  updateField(field: FieldRequest, fieldId: number): Observable<Field> {
    return this.http.put<Field>(`${this.ENDPOINT}/${fieldId}`, field).pipe(
      tap((updated) => {
        this.fieldsSignal.update((current) =>
          current.map((f) => (f.id === fieldId ? { ...f, ...updated } : f))
        );
      }),
      catchError((err) => this.handleError(err))
    );
  }

  deactivateById(id: number): Observable<void> {
    return this.http.patch<void>(`${this.ENDPOINT}/${id}/deactivate`, {}).pipe(
      tap(() => {
        this.fieldsSignal.update((current) =>
          current.map((f) => (f.id === id ? { ...f, active: false } : f))
        );
      }),
      catchError((err) => this.handleError(err))
    );
  }

  activateById(id: number): Observable<void> {
    return this.http.patch<void>(`${this.ENDPOINT}/${id}/activate`, {}).pipe(
      tap(() => {
        this.fieldsSignal.update((current) =>
          current.map((f) => (f.id === id ? { ...f, active: true } : f))
        );
      }),
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) {
    this.loadingSignal.set(false);
    const message =
      err.status === 0
        ? 'No se pudo conectar con el servidor.'
        : err.error?.message || `Error ${err.status}`;
    this.errorSignal.set(message);
    return throwError(() => err);
  }
}