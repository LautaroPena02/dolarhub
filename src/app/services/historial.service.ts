import { Injectable } from '@angular/core';
import { DolarData } from '../interfaces/dolar-data.interface';

export interface HistorialEntry {
  fecha: string;
  compra: number;
  venta: number;
}

const STORAGE_KEY = 'dolarhub-historial';
const MAX_ENTRIES_PER_TYPE = 30;

@Injectable({ providedIn: 'root' })
export class HistorialService {

  guardar(cotizaciones: { tipo: string; data: DolarData | null }[]): void {
    const historial = this.cargar();
    const ahora = new Date().toISOString();

    cotizaciones.forEach(c => {
      if (!c.data) return;
      if (!historial[c.tipo]) historial[c.tipo] = [];

      const entries = historial[c.tipo];
      const ultima = entries[entries.length - 1];
      if (ultima && ultima.compra === c.data.compra && ultima.venta === c.data.venta) return;

      entries.push({
        fecha: ahora,
        compra: c.data.compra,
        venta: c.data.venta,
      });

      if (entries.length > MAX_ENTRIES_PER_TYPE) {
        historial[c.tipo] = entries.slice(-MAX_ENTRIES_PER_TYPE);
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
    } catch {}
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

  sembrarDatosDemo(): void {
    const historial = this.cargar();
    if (Object.values(historial).some(arr => arr.length > 0)) return;

    const tipos: Record<string, [number, number]> = {
      oficial: [1050, 1100],
      blue: [1200, 1280],
      bolsa: [1180, 1240],
      ccl: [1210, 1270],
      tarjeta: [1500, 1580],
      mayorista: [1100, 1150],
      cripto: [1190, 1250],
    };

    const volatilidad: Record<string, number> = {
      oficial: 0.005,
      blue: 0.02,
      bolsa: 0.015,
      ccl: 0.015,
      tarjeta: 0.003,
      mayorista: 0.008,
      cripto: 0.018,
    };

    Object.entries(tipos).forEach(([tipo, [baseCompra, baseVenta]]) => {
      historial[tipo] = [];
      const vol = volatilidad[tipo] || 0.01;
      let compra = baseCompra;
      let venta = baseVenta;

      for (let i = 29; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        fecha.setHours(12, 0, 0, 0);

        const cambio = (Math.random() - 0.48) * vol;
        compra = Math.round(compra * (1 + cambio));
        venta = Math.round(venta * (1 + cambio));

        historial[tipo].push({
          fecha: fecha.toISOString(),
          compra,
          venta,
        });
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historial));
    } catch {}
  }
}
