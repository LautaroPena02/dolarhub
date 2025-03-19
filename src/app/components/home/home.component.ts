import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { DolarService } from '../../services/dolar.service';
import { DolarData } from '../../interfaces/dolar-data.interface';
import { CalculatorComponent } from '../calculator/calculator.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CalculatorComponent], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  dolarOficial: DolarData | null = null;
  dolarBlue: DolarData | null = null;
  dolarBolsa: DolarData | null = null;
  dolarCCL: DolarData | null = null;
  dolarTarjeta: DolarData | null = null;
  dolarMayorista: DolarData | null = null;
  dolarCripto: DolarData | null = null;
  
  tipoDolarSeleccionado: string = 'oficial';

  constructor(private dolarService: DolarService, private router: Router) {}

  ngOnInit(): void {
    this.loadDolarData();
  }
  
  seleccionarTipoDolar(tipo: string): void {
    this.tipoDolarSeleccionado = tipo;
  }
  
getDolarSeleccionado(tipo: string): DolarData | null {
  const dolarMap: { [key: string]: DolarData | null } = {
    'oficial': this.dolarOficial,
    'blue': this.dolarBlue,
    'bolsa': this.dolarBolsa,
    'ccl': this.dolarCCL,
    'tarjeta': this.dolarTarjeta,
    'mayorista': this.dolarMayorista,
    'cripto': this.dolarCripto
  };

  return dolarMap[tipo] || null; 
}

  private loadDolarData(): void {
    this.dolarService.getDolarOficial().subscribe({
      next: (data) => {
        this.dolarOficial = data;
      },
      error: (error) => console.error('Error al cargar Dólar Oficial:', error),
    });

    this.dolarService.getDolarBlue().subscribe({
      next: (data) => {
        this.dolarBlue = data;
      },
      error: (error) => console.error('Error al cargar Dólar Blue:', error),
    });

    this.dolarService.getDolarBolsa().subscribe({
      next: (data) => {
        this.dolarBolsa = data;
      },
      error: (error) => console.error('Error al cargar Dólar Bolsa:', error),
    });

    this.dolarService.getDolarCCL().subscribe({
      next: (data) => {
        this.dolarCCL = data;
      },
      error: (error) => console.error('Error al cargar Dólar CCL:', error),
    });

    this.dolarService.getDolarTarjeta().subscribe({
      next: (data) => {
        this.dolarTarjeta = data;
      },
      error: (error) => console.error('Error al cargar Dólar Tarjeta:', error),
    });

    this.dolarService.getDolarMayorista().subscribe({
      next: (data) => {
        this.dolarMayorista = data;
      },
      error: (error) => console.error('Error al cargar Dólar Mayorista:', error),
    });

    this.dolarService.getDolarCripto().subscribe({
      next: (data) => {
        this.dolarCripto = data;
      },
      error: (error) => console.error('Error al cargar Dólar Cripto:', error),
    });
  }
}