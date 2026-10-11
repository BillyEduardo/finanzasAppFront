import { Component } from '@angular/core';
import { GastosTotalesCard } from './components/gastos-totales-card/gastos-totales-card';
import { PresupuestoResumenCard } from './components/presupuesto-resumen-card/presupuesto-resumen-card';
import { DisponibleCard } from './components/disponible-card/disponible-card';
import { RegistrosCountCard } from './components/registros-count-card/registros-count-card';
import { GastosCategoriaCard } from './components/gastos-categoria-card/gastos-categoria-card';
import { RegistrosRecientesCard } from './components/registros-recientes-card/registros-recientes-card';
import { PresupuestosOverviewCard } from './components/presupuestos-overview-card/presupuestos-overview-card';
import { AccionesRapidasCard } from './components/acciones-rapidas-card/acciones-rapidas-card';
import { ConsejoDiaCard } from './components/consejo-dia-card/consejo-dia-card';

@Component({
  selector: 'app-dashboard',
  imports: [
    GastosTotalesCard,
    PresupuestoResumenCard,
    DisponibleCard,
    RegistrosCountCard,
    GastosCategoriaCard,
    RegistrosRecientesCard,
    PresupuestosOverviewCard,
    AccionesRapidasCard,
    ConsejoDiaCard,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
