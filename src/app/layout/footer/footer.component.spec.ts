import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent, FontAwesomeModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have GitHub link', () => {
    const link = fixture.nativeElement.querySelector('[aria-label="GitHub"]');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toContain('github.com');
  });

  it('should have LinkedIn link', () => {
    const link = fixture.nativeElement.querySelector('[aria-label="LinkedIn"]');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toContain('linkedin.com');
  });
});
