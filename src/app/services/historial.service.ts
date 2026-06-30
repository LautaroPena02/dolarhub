import { Injectable } from '@angular/core';
import { ArgentinaDatosEntry } from './dolar.service';

export interface HistorialEntry {
  fecha: string;
  compra: number;
  venta: number;
}

const STORAGE_KEY = 'dolarhub-historial';

@Injectable({ providedIn: 'root' })
export class HistorialService {

  procesarArgentinaDatos(data: Record<string, ArgentinaDatosEntry[]>): Record<string, HistorialEntry[]> {
    const procesado: Record<string, HistorialEntry[]> = {};
    const cache = this.cargar();
    let huboNuevosDatos = false;

    Object.entries(data).forEach(([tipo, entries]) => {
      const nuevos = entries
        .filter(e => e.compra > 0 && e.venta > 0)
        .map(e => ({
          fecha: e.fecha,
          compra: e.compra,
          venta: e.venta,
        }))
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      if (nuevos.length > 0) {
        procesado[tipo] = nuevos;
        huboNuevosDatos = true;
      } else if (cache[tipo]?.length) {
        procesado[tipo] = cache[tipo];
      }
    });

    Object.keys(cache).forEach(tipo => {
      if (!procesado[tipo] && tipo !== 'tarjeta') {
        procesado[tipo] = cache[tipo];
      }
    });

    if (procesado['oficial']?.length) {
      procesado['tarjeta'] = this.calcularTarjeta(procesado['oficial']);
      huboNuevosDatos = true;
    } else if (cache['tarjeta']?.length) {
      procesado['tarjeta'] = cache['tarjeta'];
    }

    if (huboNuevosDatos) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(procesado));
      } catch {}
    }

    return Object.keys(procesado).length > 0 ? procesado : cache;
  }

  private getMultiplicadorTarjeta(fecha: string): number {
    const ts = new Date(fecha).getTime();

    if (ts >= new Date('2024-12-23').getTime()) return 1.30;
    if (ts >= new Date('2023-12-13').getTime()) return 1.60;
    if (ts >= new Date('2023-11-23').getTime()) return 2.55;
    if (ts >= new Date('2023-10-10').getTime()) return 2.00;
    if (ts >= new Date('2020-09-14').getTime()) return 1.65;
    if (ts >= new Date('2019-12-23').getTime()) return 1.30;
    return 1.00;
  }

  private calcularTarjeta(oficial: HistorialEntry[]): HistorialEntry[] {
    return oficial.map(e => ({
      fecha: e.fecha,
      compra: +(e.compra * this.getMultiplicadorTarjeta(e.fecha)).toFixed(2),
      venta: +(e.venta * this.getMultiplicadorTarjeta(e.fecha)).toFixed(2),
    }));
  }

  cargar(): Record<string, HistorialEntry[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  obtener(tipo: string): HistorialEntry[] {
    const historial = this.cargar();
    return historial[tipo] || [];
  }
}
