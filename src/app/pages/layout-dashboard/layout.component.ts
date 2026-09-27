import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { ErrorResponse } from '@core/interfaces/error-response';
import { Link } from '@core/interfaces/link.interface';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { LINKS_DASHBOARD } from '@shared/constants/links.constants';
import { User } from '@user/interfaces/user';
import { UserService } from '@user/services/user.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, LoadingComponent, RouterLink],
  templateUrl: './layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly alertService = inject(AlertService);

  userActive!: User;
  sidebarOpen = false;
  loading = signal<boolean>(true);
  links = signal<Link[]>([]);

  ngOnInit(): void {
    const claims = this.authService.getClaimsFromToken();
    if (claims) {
      const email = claims.sub;
      if (typeof email === 'string') {
        this.userService.getCurrentUser().subscribe({
          next: (user: User) => {
            if (!user) {
              this.loading.set(false);
              this.alertService.error('Error', 'No se pudo obtener la información del usuario.');
              this.authService.logout();
              return;
            }
            this.userActive = user;
            this.authService.setUser(user);
            this.loadLinks();
            this.loading.set(false);
          },
          error: (err: ErrorResponse) => {
            this.loading.set(false);
            this.alertService.error(
              'Error al obtener usuario',
              err.error.message || 'Hubo un error inesperado'
            );
          }
        });
      } else {
        this.loading.set(false);
        this.alertService.error('Error', 'No se pudo obtener el correo del usuario.');
        this.authService.logout();
      }
    } else {
      this.authService.logout();
      this.loading.set(false);
    }
  }

  loadLinks() {
    this.links.set(LINKS_DASHBOARD);
  }

  getImageUrl(user: User): string {
    return user.imageUrl?.startsWith('http') ? user.imageUrl : '/assets/profile_icon.webp';
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  onLogoutClick(): void {
    this.closeSidebar();
    this.logout();
  }

  logout(): void {
    this.alertService
      .confirm(
        '¿Cerrar sesión?',
        '¿Estás seguro de que deseas cerrar sesión?',
        'Si, cerrar sesión',
        'Cancelar',
      )
      .then(confirmed => {
        if (confirmed) {
          this.authService.logout();
          this.alertService.success('Sesión cerrada', 'Has cerrado sesión correctamente.');
        }
      });
  }
}