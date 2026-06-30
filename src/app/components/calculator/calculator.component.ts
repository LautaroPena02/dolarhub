import { Component, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { DolarData } from '../../interfaces/dolar-data.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCopy, faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface MontosMap {
  [key: string]: number;
}

interface TipoOption {
  key: string;
  label: string;
}

const TIPOS_DOLAR: TipoOption[] = [
  { key: 'blue', label: 'Blue' },
  { key: 'oficial', label: 'Oficial' },
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
export class CalculatorComponent implements OnChanges {
  @Input() tipoDolarSeleccionado = 'blue';
  @Output() tipoDolarSeleccionadoChange = new EventEmitter<string>();
  @Input() dolarOficial: DolarData | null = null;
  @Input() dolarBlue: DolarData | null = null;
  @Input() dolarBolsa: DolarData | null = null;
  @Input() dolarCCL: DolarData | null = null;
  @Input() dolarTarjeta: DolarData | null = null;
  @Input() dolarMayorista: DolarData | null = null;
  @Input() dolarCripto: DolarData | null = null;
  @Input() tiposOcultos: string[] = [];
  @Input() favoritos: string[] = [];

  tipos = TIPOS_DOLAR;

  get tiposVisibles(): TipoOption[] {
    return this.tipos.filter(t => !this.tiposOcultos.includes(t.key));
  }

  get tiposOrdenados(): TipoOption[] {
    const visibles = this.tiposVisibles;
    const blue = visibles.filter(t => t.key === 'blue');
    const favs = visibles.filter(t => t.key !== 'blue' && this.favoritos.includes(t.key));
    const rest = visibles.filter(t => t.key !== 'blue' && !this.favoritos.includes(t.key));
    return [...blue, ...favs, ...rest];
  }
  mostrarCalculadoraDolarAPesos = true;
  copied = false;
  montoInput = 0;
  dropdownOpen = false;

  faCopy = faCopy;
  faCheck = faCheck;
  faChevronDown = faChevronDown;
  faStarSolid = faStarSolid;

  constructor(private elRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tiposOcultos'] && this.tiposOcultos.includes(this.tipoDolarSeleccionado)) {
      const first = this.tiposVisibles[0];
      if (first) {
        this.tipoDolarSeleccionado = first.key;
        this.tipoDolarSeleccionadoChange.emit(first.key);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  seleccionarTipo(key: string): void {
    this.tipoDolarSeleccionado = key;
    this.tipoDolarSeleccionadoChange.emit(key);
    this.dropdownOpen = false;
  }

  get nombreTipoSeleccionado(): string {
    return this.tipos.find(t => t.key === this.tipoDolarSeleccionado)?.label || '';
  }

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
