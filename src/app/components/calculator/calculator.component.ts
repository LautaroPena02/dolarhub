import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DolarData } from '../../interfaces/dolar-data.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

interface MontosMap {
  [key: string]: number;
}

interface TipoOption {
  key: string;
  label: string;
}

const TIPOS_DOLAR: TipoOption[] = [
  { key: 'oficial', label: 'Oficial' },
  { key: 'blue', label: 'Blue' },
  { key: 'bolsa', label: 'Bolsa' },
  { key: 'ccl', label: 'CCL' },
  { key: 'tarjeta', label: 'Tarjeta' },
  { key: 'mayorista', label: 'Mayorista' },
  { key: 'cripto', label: 'Cripto' },
];

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css'],
})
export class CalculatorComponent {
  @Input() tipoDolarSeleccionado = 'oficial';
  @Input() dolarOficial: DolarData | null = null;
  @Input() dolarBlue: DolarData | null = null;
  @Input() dolarBolsa: DolarData | null = null;
  @Input() dolarCCL: DolarData | null = null;
  @Input() dolarTarjeta: DolarData | null = null;
  @Input() dolarMayorista: DolarData | null = null;
  @Input() dolarCripto: DolarData | null = null;

  tipos = TIPOS_DOLAR;
  mostrarCalculadoraDolarAPesos = true;
  copied = false;
  montoInput = 0;

  faCopy = faCopy;
  faCheck = faCheck;

  get montoValido(): boolean {
    return this.montoInput >= 0;
  }

  getDolarSeleccionado(): DolarData | null {
    const map: Record<string, DolarData | null> = {
      oficial: this.dolarOficial,
      blue: this.dolarBlue,
      bolsa: this.dolarBolsa,
      ccl: this.dolarCCL,
      tarjeta: this.dolarTarjeta,
      mayorista: this.dolarMayorista,
      cripto: this.dolarCripto,
    };
    return map[this.tipoDolarSeleccionado] || null;
  }

  get resultado(): number {
    const dolar = this.getDolarSeleccionado();
    if (!dolar || !this.montoValido) return 0;
    if (this.mostrarCalculadoraDolarAPesos) {
      return +(this.montoInput * dolar.venta).toFixed(2);
    }
    return +(this.montoInput / dolar.compra).toFixed(2);
  }

  get resultadoFormateado(): string {
    const dolar = this.getDolarSeleccionado();
    if (!dolar) return '';
    if (this.mostrarCalculadoraDolarAPesos) {
      return this.resultado.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
      });
    }
    return this.resultado.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  }

  get monedaOrigen(): string {
    return this.mostrarCalculadoraDolarAPesos ? 'USD' : 'ARS';
  }

  get monedaDestino(): string {
    return this.mostrarCalculadoraDolarAPesos ? 'ARS' : 'USD';
  }

  copiarResultado(): void {
    const text = `${this.resultadoFormateado} (${this.getTituloCalculadora()})`;
    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    }).catch(() => {});
  }

  getTituloCalculadora(): string {
    const found = TIPOS_DOLAR.find(t => t.key === this.tipoDolarSeleccionado);
    return found ? `Dólar ${found.label}` : 'Dólar';
  }

  onInputChange(): void {
    if (this.montoInput < 0) this.montoInput = 0;
  }
}
