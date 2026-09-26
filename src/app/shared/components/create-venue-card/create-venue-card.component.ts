import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-create-venue-card',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mt-8">
      <div
        class="overflow-hidden rounded-lg border border-gray-100 bg-gray-100 shadow-md transition-shadow duration-300 hover:shadow-md">
        <div class="flex flex-col gap-8 p-6 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-5">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </div>

            <div>
              <p class="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Configuración inicial
              </p>

              <h3 class="mt-1 text-2xl font-bold text-gray-900">Registra tu complejo deportivo</h3>

              <p class="mt-2 max-w-xl text-sm text-gray-500">
                Aún no tienes complejo deportivo registrado. Crea tu complejo deportivo y añade las
                canchas para que los usuarios puedan reservar en línea y comenzar a gestionar tus
                reservas desde TapiMatch.
              </p>
            </div>
          </div>

          <div class="w-full md:w-auto">
            <app-button
              class="w-full md:w-auto"
              (clicked)="goToPage('/dashboard/complejo-deportivo')">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
              </svg>

              Crear complejo deportivo
            </app-button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class CreateVenueCardComponent {
  private readonly router = inject(Router);

  goToPage(page: string): void {
    this.router.navigate([page]);
  }
}
