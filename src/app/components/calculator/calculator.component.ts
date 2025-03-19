import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DolarData } from '../../interfaces/dolar-data.interface';

interface MontosMap {
  [key: string]: number;
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css'],
})
export class CalculatorComponent implements OnInit {
  @Input() tipoDolarSeleccionado: string = 'oficial';
  @Input() dolarOficial: DolarData | null = null;
  @Input() dolarBlue: DolarData | null = null;
  @Input() dolarBolsa: DolarData | null = null;
  @Input() dolarCCL: DolarData | null = null;
  @Input() dolarTarjeta: DolarData | null = null;
  @Input() dolarMayorista: DolarData | null = null;
  @Input() dolarCripto: DolarData | null = null;

  montosDolar: MontosMap = {
    oficial: 0,
    blue: 0,
    bolsa: 0,
    ccl: 0,
    tarjeta: 0,
    mayorista: 0,
    cripto: 0
  };

  montosPesos: MontosMap = {
    oficial: 0,
    blue: 0,
    bolsa: 0,
    ccl: 0,
    tarjeta: 0,
    mayorista: 0,
    cripto: 0
  };

  mostrarCalculadoraDolarAPesos: boolean = true;
  constructor() { }
  
  ngOnInit(): void { }

  getTituloCalculadora(): string {
    const titulos: { [key: string]: string } = {
      'oficial': 'Dólar Oficial',
      'blue': 'Dólar Blue',
      'bolsa': 'Dólar Bolsa',
      'ccl': 'Dólar CCL',
      'tarjeta': 'Dólar Tarjeta',
      'mayorista': 'Dólar Mayorista',
      'cripto': 'Dólar Cripto'
    };
    
    return titulos[this.tipoDolarSeleccionado] || 'Dólar';
  }

  getDolarSeleccionado(): DolarData | null {
    const dolarMap: { [key: string]: DolarData | null } = {
      'oficial': this.dolarOficial,
      'blue': this.dolarBlue,
      'bolsa': this.dolarBolsa,
      'ccl': this.dolarCCL,
      'tarjeta': this.dolarTarjeta,
      'mayorista': this.dolarMayorista,
      'cripto': this.dolarCripto
    };
    
    return dolarMap[this.tipoDolarSeleccionado];
  }

  convertir(tipo: string): void {
    const dolar = this.getDolarSeleccionado();
    if (dolar && dolar.venta && this.montosDolar[tipo] !== undefined) {
      this.montosPesos[tipo] = +(this.montosDolar[tipo] * dolar.venta).toFixed(2);
    }
  }

  convertirInverso(tipo: string): void {
    const dolar = this.getDolarSeleccionado();
    if (dolar && dolar.compra && this.montosPesos[tipo] !== undefined) {
      this.montosDolar[tipo] = +(this.montosPesos[tipo] / dolar.compra).toFixed(2);
    }
  }

  toggleCalculadora() {
    this.mostrarCalculadoraDolarAPesos = !this.mostrarCalculadoraDolarAPesos;
  }
}
