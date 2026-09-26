import { Service } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Service()
export class AlertService {

  confirm(
  title: string,
  text: string,
  confirmButtonText = 'Aceptar',
  cancelButtonText = 'Cancelar',
  confirmButtonColor = '#28C464',
  cancelButtonColor = '#374151'
): Promise<boolean> {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    cancelButtonText
  }).then(result => result.isConfirmed);
}

  success(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'success',
      customClass: { confirmButton: 'swal-confirm-btn' },
      buttonsStyling: false
    });
  }

  error(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'error',
      customClass: { confirmButton: 'swal-confirm-btn' },
      buttonsStyling: false
    });
  }

  notify(title: string, text: string, icon: SweetAlertIcon = 'info'): void {
    Swal.fire({
      title,
      text,
      icon,
      customClass: { confirmButton: 'swal-confirm-btn' },
      buttonsStyling: false
    });
  }
}
