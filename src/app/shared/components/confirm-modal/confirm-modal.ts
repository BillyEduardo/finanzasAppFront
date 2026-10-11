import { Component, input, output } from '@angular/core';
import { LucideIconsModule } from '../../LucideIconsModule';

export type ConfirmModalVariant = 'primary' | 'danger';

@Component({
  selector: 'app-confirm-modal',
  imports: [LucideIconsModule],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly icon = input<string | null>('circle-alert');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly confirmVariant = input<ConfirmModalVariant>('primary');
  readonly loading = input(false);
  readonly closeOnBackdrop = input(true);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
  readonly closed = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if (!this.closeOnBackdrop() || this.loading()) return;
    if (event.target === event.currentTarget) this.cancel();
  }

  cancel(): void {
    if (this.loading()) return;
    this.cancelled.emit();
    this.closed.emit();
  }

  confirm(): void {
    if (this.loading()) return;
    this.confirmed.emit();
  }
}
