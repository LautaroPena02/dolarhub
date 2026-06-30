import {
  Component, Input, OnChanges, SimpleChanges,
  ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { HistorialEntry } from '../../services/historial.service';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.component.html',
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() entries: HistorialEntry[] = [];
  @Input() tipoNombre = '';
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    if (this.entries.length > 0) {
      this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entries'] && this.chartCanvas) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private createChart(): void {
    if (this.chart) this.chart.destroy();

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.entries.map(e => {
      const d = new Date(e.fecha);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

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
            data: this.entries.map(e => e.compra),
            borderColor: '#1ead11',
            backgroundColor: gradientCompra,
            fill: true,
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2,
          },
          {
            label: 'Venta',
            data: this.entries.map(e => e.venta),
            borderColor: '#3b82f6',
            backgroundColor: gradientVenta,
            fill: true,
            tension: 0.35,
            pointRadius: 2,
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
            ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 45 },
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

    const labels = this.entries.map(e => {
      const d = new Date(e.fecha);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = this.entries.map(e => e.compra);
    this.chart.data.datasets[1].data = this.entries.map(e => e.venta);
    this.chart.update('none');
  }
}
