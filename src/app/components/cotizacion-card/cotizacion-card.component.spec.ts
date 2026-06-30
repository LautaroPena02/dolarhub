import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CotizacionCardComponent } from './cotizacion-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('CotizacionCardComponent', () => {
  let component: CotizacionCardComponent;
  let fixture: ComponentFixture<CotizacionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CotizacionCardComponent, FontAwesomeModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CotizacionCardComponent);
    component = fixture.componentInstance;
    component.tipo = 'blue';
    component.nombre = 'Dólar Blue';
    component.compra = 1200;
    component.venta = 1250;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit select on click', () => {
    spyOn(component.select, 'emit');
    const el = fixture.nativeElement.querySelector('[role="button"]');
    el.click();
    expect(component.select.emit).toHaveBeenCalledWith('blue');
  });

  it('should emit toggleFavorite on favorite button click', () => {
    spyOn(component.toggleFavorite, 'emit');
    const btn = fixture.nativeElement.querySelector('[aria-label="Agregar a favoritos"]');
    btn.click();
    expect(component.toggleFavorite.emit).toHaveBeenCalledWith('blue');
  });
});
