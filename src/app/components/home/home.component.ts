import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DolarService } from '../../services/dolar.service';
import { HistorialService, HistorialEntry } from '../../services/historial.service';
import { DolarData } from '../../interfaces/dolar-data.interface';
import { CalculatorComponent } from '../calculator/calculator.component';
import { CotizacionCardComponent, VariacionData } from '../cotizacion-card/cotizacion-card.component';
import { ChartComponent } from '../chart/chart.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRefresh, faExclamationTriangle, faStar, faClock } from '@fortawesome/free-solid-svg-icons';

interface CotizacionEntry {
  tipo: string;
  nombre: string;
  data: DolarData | null;
  variacion: VariacionData | null;
}

const STORAGE_FAVS = 'dolarhub-favoritos';
const STORAGE_PREV = 'dolarhub-anteriores';

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
    { tipo: 'oficial', nombre: 'Dólar Oficial', data: null, variacion: null },
    { tipo: 'blue', nombre: 'Dólar Blue', data: null, variacion: null },
    { tipo: 'bolsa', nombre: 'Dólar Bolsa', data: null, variacion: null },
    { tipo: 'ccl', nombre: 'Dólar CCL', data: null, variacion: null },
    { tipo: 'tarjeta', nombre: 'Dólar Tarjeta', data: null, variacion: null },
    { tipo: 'mayorista', nombre: 'Dólar Mayorista', data: null, variacion: null },
    { tipo: 'cripto', nombre: 'Dólar Cripto', data: null, variacion: null },
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
    this.historialService.sembrarDatosDemo();
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

    forkJoin(requests).subscribe({
      next: ([oficial, blue, bolsa, ccl, tarjeta, mayorista, cripto]) => {
        const results: (DolarData | null)[] = [oficial, blue, bolsa, ccl, tarjeta, mayorista, cripto];
        const prevData = this.cargarAnteriores();

        this.cotizaciones.forEach((entry, i) => {
          entry.data = results[i];
          entry.variacion = this.calcularVariacion(entry.tipo, results[i], prevData);
        });

        this.actualizarUltimaActualizacion();
        this.guardarAnteriores();
        this.historialService.guardar(this.cotizaciones);
        this.historialMap = this.historialService.cargar();
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

  private calcularVariacion(
    tipo: string,
    actual: DolarData | null,
    prevMap: Record<string, { compra: number; venta: number }>
  ): VariacionData | null {
    if (!actual) return null;
    const prev = prevMap[tipo];
    if (!prev) return null;
    const prevProm = (prev.compra + prev.venta) / 2;
    const currProm = (actual.compra + actual.venta) / 2;
    if (prevProm === 0) return null;
    const diff = ((currProm - prevProm) / prevProm) * 100;
    const absDiff = Math.abs(diff);
    if (absDiff < 0.01) {
      return { tipo: 'estable', porcentaje: 0 };
    }
    return {
      tipo: diff > 0 ? 'subio' : 'bajo',
      porcentaje: Math.round(absDiff * 100) / 100
    };
  }

  private cargarAnteriores(): Record<string, { compra: number; venta: number }> {
    try {
      const raw = localStorage.getItem(STORAGE_PREV);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  private guardarAnteriores(): void {
    const data: Record<string, { compra: number; venta: number }> = {};
    this.cotizaciones.forEach(c => {
      if (c.data) {
        data[c.tipo] = { compra: c.data.compra, venta: c.data.venta };
      }
    });
    try {
      localStorage.setItem(STORAGE_PREV, JSON.stringify(data));
    } catch {}
  }
}
