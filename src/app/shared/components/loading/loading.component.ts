import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-component',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-5">
      <img src="assets/nuevo_logo_sinfondo.webp" alt="Logo TapiMatch" class="w-16 h-auto" />
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent border-r-transparent"></div>

      <span class="text-lg text-gray-700">Accediendo a TapiMatch</span>
    </div>
  `
})
export class LoadingComponent {}
