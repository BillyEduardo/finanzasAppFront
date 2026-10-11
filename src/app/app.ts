import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  /** Ensures theme preference is applied as soon as the app boots. */
  private readonly theme = inject(ThemeService);
  protected readonly title = signal('finanzasAppFront');
}
