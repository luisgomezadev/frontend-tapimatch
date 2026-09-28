import { Component, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      (click)="handleClick()"
      [disabled]="disabled"
      [class]="classes"
      [title]="text">
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() text = '';
  @Input() color: 'primary' | 'secondary' | 'white' = 'primary';
  @Input() size: 'big' | 'small' = 'small';
  @Input() routerLink: string[] | null = null;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;

  @Output() clicked = new EventEmitter<void>();

  handleClick() {
    this.clicked.emit();
  }

  get classes(): string {
    let base =
      'w-full inline-flex items-center justify-center gap-2 hover:shadow-md transform transition-all duration-300 disabled:opacity-60 disabled:hover:shadow-none disabled:cursor-not-allowed';

    if (this.size === 'big') base += ' py-3 md:py-4 px-5 sm:px-10 font-semibold text-base md:text-lg rounded-lg';
    else base += ' px-4 py-2 font-medium rounded-lg';

    if (this.color === 'primary') {
      return base + ' bg-primary text-white hover:bg-hover-primary disabled:hover:bg-primary';
    }

    if (this.color === 'white') {
      return (
        base +
        ' bg-white/90 text-black hover:bg-hover-white/90 border border-gray-300 hover:border-gray-400 disabled:hover:bg-white/90 disabled:hover:border-gray-300'
      );
    }

    return base + ' bg-secondary/10 text-black hover:bg-hover-secondary/15';
  }
}
