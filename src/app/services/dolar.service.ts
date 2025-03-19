import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { DolarData } from '../interfaces/dolar-data.interface'; 

@Injectable({
  providedIn: 'root',
})
export class DolarService {
  private baseUrl = 'https://dolarapi.com/v1/dolares'; 

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
}