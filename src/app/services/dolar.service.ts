import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, forkJoin, map } from 'rxjs';
import { DolarData } from '../interfaces/dolar-data.interface';

export interface ArgentinaDatosEntry {
  casa: string;
  compra: number;
  venta: number;
  fecha: string;
}

@Injectable({
  providedIn: 'root',
})
export class DolarService {
  private baseUrl = 'https://dolarapi.com/v1/dolares';
  private argentinaDatosUrl = 'https://api.argentinadatos.com/v1/cotizaciones/dolares';

  private casaMap: Record<string, string> = {
    oficial: 'oficial',
    blue: 'blue',
    bolsa: 'bolsa',
    ccl: 'contadoconliqui',
    tarjeta: 'solidario',
    mayorista: 'mayorista',
    cripto: 'cripto',
  };

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error al procesar la solicitud.';
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else if (error.status === 404) {
        errorMessage = 'El recurso solicitado no fue encontrado.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor.';
      } else {
        errorMessage = `Código de error: ${error.status}, Mensaje: ${error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(errorMessage);
  }

  getDolarOficial(): Observable<DolarData> {
    return this.http.get<DolarData>(`${this.baseUrl}/oficial`).pipe(
      catchError(this.handleError)
    );
  }

  getDolarBlue(): Observable<DolarData> {
    return this.http.get<DolarData>(`${this.baseUrl}/blue`).pipe(
      catchError(this.handleError)
    );
  }

  getDolarBolsa(): Observable<DolarData> {
    return this.http.get<DolarData>(`${this.baseUrl}/bolsa`).pipe(
      catchError(this.handleError)
    );
  }

  getDolarCCL(): Observable<DolarData> {
    return this.http.get<DolarData>(`${this.baseUrl}/contadoconliqui`).pipe(
      catchError(this.handleError)
    );
  }

  getDolarTarjeta(): Observable<DolarData> {
    return this.http.get<DolarData>(`${this.baseUrl}/tarjeta`).pipe(
      catchError(this.handleError)
    );
  }

  getDolarMayorista(): Observable<DolarData> {
    return this.http.get<DolarData>(`${this.baseUrl}/mayorista`).pipe(
      catchError(this.handleError)
    );
  }

  getDolarCripto(): Observable<DolarData> {
    return this.http.get<DolarData>(`${this.baseUrl}/cripto`).pipe(
      catchError(this.handleError)
    );
  }

  getHistoricoArgentinaDatos(): Observable<Record<string, ArgentinaDatosEntry[]>> {
    const tipos = Object.keys(this.casaMap);
    const requests = tipos.map(tipo => {
      const casa = this.casaMap[tipo];
      return this.http.get<ArgentinaDatosEntry[]>(`${this.argentinaDatosUrl}/${casa}`).pipe(
        catchError(() => [])
      );
    });

    return forkJoin(requests).pipe(
      map(results => {
        const historial: Record<string, ArgentinaDatosEntry[]> = {};
        tipos.forEach((tipo, i) => {
          historial[tipo] = results[i];
        });
        return historial;
      })
    );
  }
}
