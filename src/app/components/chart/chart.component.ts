import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, Inject, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { HistorialEntry } from '../../services/historial.service';

Chart.register(...registerables);

type RangoTemporal = '24h' | '7d' | '30d' | '1a';

interface RangoOption {
  key: RangoTemporal;
  label: string;
  horas: number;
}

const RANGOS: RangoOption[] = [
  { key: '24h', label: '24 Horas', horas: 24 },
  { key: '7d', label: '7 Días', horas: 7 * 24 },
  { key: '30d', label: '30 Días', horas: 30 * 24 },
  { key: '1a', label: '1 Año', horas: 365 * 24 },
];

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.component.html',
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() entries: HistorialEntry[] = [];
  @Input() tipoNombre = '';
  @Input() resetKey = 0;
  @Output() rangoChange = new EventEmitter<RangoTemporal>();
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  rangos = RANGOS;
  rangoSeleccionado: RangoTemporal = '24h';
  private chart: Chart | null = null;
  private isBrowser: boolean;

  constructor(private zone: NgZone, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get entriesFiltradas(): HistorialEntry[] {
    const rango = RANGOS.find(r => r.key === this.rangoSeleccionado);
    if (!rango) return this.entries;
    if (this.rangoSeleccionado === '24h') {
      return this.entries.length >= 2 ? this.entries.slice(-2) : this.entries;
    }
    const desde = new Date(Date.now() - rango.horas * 60 * 60 * 1000);
    const filtradas = this.entries.filter(e => new Date(e.fecha) >= desde);
    return filtradas.length > 0 ? filtradas : this.entries.slice(-1);
  }

  get cantidadPuntos(): number {
    return this.entriesFiltradas.length;
  }

  ngAfterViewInit(): void {
    if (this.isBrowser && this.entries.length > 0) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isBrowser && this.chartCanvas) {
      if (changes['resetKey'] && !changes['resetKey'].firstChange) {
        this.rangoSeleccionado = '24h';
        this.rangoChange.emit('24h');
      }
      if (changes['entries']) {
        this.updateChart();
      } else if (changes['resetKey'] && !changes['resetKey'].firstChange) {
        this.updateChart();
      }
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  seleccionarRango(key: RangoTemporal): void {
    this.rangoSeleccionado = key;
    this.rangoChange.emit(key);
    if (this.isBrowser) {
      this.updateChart();
    }
  }

  private createChart(): void {
    if (!this.isBrowser) return;
    if (this.chart) this.chart.destroy();

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const entries = this.entriesFiltradas;
    const labels = entries.map(e => this.formatearLabel(e.fecha));

    const gradientCompra = ctx.createLinearGradient(0, 0, 0, 220);
    gradientCompra.addColorStop(0, 'rgba(30, 173, 17, 0.25)');
    gradientCompra.addColorStop(1, 'rgba(30, 173, 17, 0.0)');

    const gradientVenta = ctx.createLinearGradient(0, 0, 0, 220);
    gradientVenta.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    gradientVenta.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Compra',
            data: entries.map(e => e.compra),
            borderColor: '#1ead11',
            backgroundColor: gradientCompra,
            fill: true,
            tension: 0.35,
            pointRadius: this.rangoSeleccionado === '1a' ? 0 : 2,
            pointHoverRadius: 5,
            borderWidth: 2,
          },
          {
            label: 'Venta',
            data: entries.map(e => e.venta),
            borderColor: '#3b82f6',
            backgroundColor: gradientVenta,
            fill: true,
            tension: 0.35,
            pointRadius: this.rangoSeleccionado === '1a' ? 0 : 2,
            pointHoverRadius: 5,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#9ca3af',
              font: { size: 11, family: "'Segoe UI', system-ui, sans-serif" },
              boxWidth: 12,
              padding: 12,
            },
            onHover: () => {
              if (this.chart?.canvas) this.chart.canvas.style.cursor = 'pointer';
            },
            onLeave: () => {
              if (this.chart?.canvas) this.chart.canvas.style.cursor = 'default';
            },
          },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#f3f4f6',
            bodyColor: '#9ca3af',
            borderColor: '#1f2937',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('es-AR')}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 45, maxTicksLimit: 12 },
            grid: { color: 'rgba(31, 41, 55, 0.4)' },
          },
          y: {
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              callback: (v) => `$${Number(v).toLocaleString('es-AR')}`,
            },
            grid: { color: 'rgba(31, 41, 55, 0.4)' },
          },
        },
      },
    };

    this.zone.runOutsideAngular(() => {
      this.chart = new Chart(ctx, config);
    });
  }

  private updateChart(): void {
    if (!this.chart) {
      this.createChart();
      return;
    }

    const entries = this.entriesFiltradas;
    const labels = entries.map(e => this.formatearLabel(e.fecha));

    this.chart.data.labels = labels;
    (this.chart.data.datasets[0] as any).data = entries.map(e => e.compra);
    (this.chart.data.datasets[1] as any).data = entries.map(e => e.venta);
    (this.chart.data.datasets[0] as any).pointRadius = this.rangoSeleccionado === '1a' ? 0 : 2;
    (this.chart.data.datasets[1] as any).pointRadius = this.rangoSeleccionado === '1a' ? 0 : 2;
    this.chart.update('none');
  }

  private formatearLabel(fecha: string): string {
    const d = new Date(fecha);
    if (this.rangoSeleccionado === '24h') {
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }
    if (this.rangoSeleccionado === '1a') {
      return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
    }
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
}
