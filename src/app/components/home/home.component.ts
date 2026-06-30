import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, mergeMap } from 'rxjs';
import { DolarService } from '../../services/dolar.service';
import { HistorialService, HistorialEntry } from '../../services/historial.service';
import { DolarData } from '../../interfaces/dolar-data.interface';
import { CalculatorComponent } from '../calculator/calculator.component';
import { CotizacionCardComponent } from '../cotizacion-card/cotizacion-card.component';
import { ChartComponent } from '../chart/chart.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRefresh, faExclamationTriangle, faStar, faClock } from '@fortawesome/free-solid-svg-icons';

interface CotizacionEntry {
  tipo: string;
  nombre: string;
  data: DolarData | null;
}

const STORAGE_FAVS = 'dolarhub-favoritos';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CalculatorComponent,
    CotizacionCardComponent, ChartComponent, FontAwesomeModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  cotizaciones: CotizacionEntry[] = [
    { tipo: 'oficial', nombre: 'Dólar Oficial', data: null },
    { tipo: 'blue', nombre: 'Dólar Blue', data: null },
    { tipo: 'bolsa', nombre: 'Dólar Bolsa', data: null },
    { tipo: 'ccl', nombre: 'Dólar CCL', data: null },
    { tipo: 'tarjeta', nombre: 'Dólar Tarjeta', data: null },
    { tipo: 'mayorista', nombre: 'Dólar Mayorista', data: null },
    { tipo: 'cripto', nombre: 'Dólar Cripto', data: null },
  ];

  tipoDolarSeleccionado = 'oficial';
  isLoading = true;
  hasError = false;
  errorMessage = '';
  ultimaActualizacion: string | null = null;
  favoritos: string[] = [];

  historialEntries: HistorialEntry[] = [];
  historialMap: Record<string, HistorialEntry[]> = {};

  faRefresh = faRefresh;
  faExclamationTriangle = faExclamationTriangle;
  faStar = faStar;
  faClock = faClock;

  constructor(
    private dolarService: DolarService,
    private historialService: HistorialService
  ) {}

  ngOnInit(): void {
    this.cargarFavoritos();
    this.historialMap = this.historialService.cargar();
    this.actualizarHistorialSeleccionado();
    this.loadDolarData();
  }

  get cotizacionesOrdenadas(): CotizacionEntry[] {
    const favs = this.cotizaciones.filter(c => this.favoritos.includes(c.tipo));
    const rest = this.cotizaciones.filter(c => !this.favoritos.includes(c.tipo));
    return [...favs, ...rest];
  }

  getDolarSeleccionado(tipo: string): DolarData | null {
    return this.cotizaciones.find(c => c.tipo === tipo)?.data || null;
  }

  get nombreSeleccionado(): string {
    return this.cotizaciones.find(c => c.tipo === this.tipoDolarSeleccionado)?.nombre || this.tipoDolarSeleccionado;
  }

  get tieneHistorial(): boolean {
    return this.historialEntries.length > 0;
  }

  private actualizarHistorialSeleccionado(): void {
    this.historialEntries = this.historialMap[this.tipoDolarSeleccionado] || [];
  }

  seleccionarTipoDolar(tipo: string): void {
    this.tipoDolarSeleccionado = tipo;
    this.actualizarHistorialSeleccionado();
  }

  toggleFavorito(tipo: string): void {
    const idx = this.favoritos.indexOf(tipo);
    if (idx >= 0) {
      this.favoritos.splice(idx, 1);
    } else {
      if (this.favoritos.length < 2) {
        this.favoritos.push(tipo);
      }
    }
    this.guardarFavoritos();
  }

  refresh(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.loadDolarData();
  }

  private cargarFavoritos(): void {
    try {
      const stored = localStorage.getItem(STORAGE_FAVS);
      if (stored) this.favoritos = JSON.parse(stored);
    } catch {}
  }

  private guardarFavoritos(): void {
    try {
      localStorage.setItem(STORAGE_FAVS, JSON.stringify(this.favoritos));
    } catch {}
  }

  private loadDolarData(): void {
    this.isLoading = true;

    const requests = [
      this.dolarService.getDolarOficial(),
      this.dolarService.getDolarBlue(),
      this.dolarService.getDolarBolsa(),
      this.dolarService.getDolarCCL(),
      this.dolarService.getDolarTarjeta(),
      this.dolarService.getDolarMayorista(),
      this.dolarService.getDolarCripto(),
    ];

    forkJoin(requests).pipe(
      mergeMap(([oficial, blue, bolsa, ccl, tarjeta, mayorista, cripto]) => {
        const results: (DolarData | null)[] = [oficial, blue, bolsa, ccl, tarjeta, mayorista, cripto];

        this.cotizaciones.forEach((entry, i) => {
          entry.data = results[i];
        });

        this.actualizarUltimaActualizacion();

        return this.dolarService.getHistoricoArgentinaDatos();
      })
    ).subscribe({
      next: (argentinaDatosData) => {
        this.historialMap = this.historialService.procesarArgentinaDatos(argentinaDatosData);
        this.actualizarHistorialSeleccionado();
        this.isLoading = false;
        this.hasError = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = err || 'Error al cargar las cotizaciones. Verificá tu conexión.';
      }
    });
  }

  private actualizarUltimaActualizacion(): void {
    const fechas = this.cotizaciones
      .map(c => c.data?.fechaActualizacion)
      .filter(Boolean) as string[];
    if (fechas.length > 0) {
      fechas.sort();
      this.ultimaActualizacion = fechas[fechas.length - 1];
    }
  }
}
