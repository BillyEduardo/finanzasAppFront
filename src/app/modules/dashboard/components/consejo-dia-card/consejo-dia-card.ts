import { Component, signal } from '@angular/core';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';

@Component({
  selector: 'app-consejo-dia-card',
  imports: [LucideIconsModule],
  templateUrl: './consejo-dia-card.html',
  styleUrl: './consejo-dia-card.scss',
})
export class ConsejoDiaCard {
  readonly visible = signal(true);
  readonly tip =
    'Revisa tus gastos de ocio esta semana: suelen ser los más fáciles de ajustar sin afectar tu calidad de vida.';

  dismiss(): void {
    this.visible.set(false);
  }
}
