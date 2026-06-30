import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-cotizacion-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './cotizacion-card.component.html',
  styleUrls: ['./cotizacion-card.component.css']
})
export class CotizacionCardComponent {
  @Input() tipo = '';
  @Input() nombre = '';
  @Input() compra: number | null = null;
  @Input() venta: number | null = null;
  @Input() variacion: number | null = null;
  @Input() isSelected = false;
  @Input() isFavorite = false;
  @Input() isLoading = false;

  @Output() select = new EventEmitter<string>();
  @Output() toggleFavorite = new EventEmitter<string>();

  faStarSolid = faStarSolid;
  faStarRegular = faStarRegular;

  onSelect(): void {
    if (!this.isLoading) {
      this.select.emit(this.tipo);
    }
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    this.toggleFavorite.emit(this.tipo);
  }
}
