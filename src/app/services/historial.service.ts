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
      if (!procesado[tipo]) {
        procesado[tipo] = cache[tipo];
      }
    });

    if (huboNuevosDatos) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(procesado));
      } catch {}
    }

    return Object.keys(procesado).length > 0 ? procesado : cache;
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
