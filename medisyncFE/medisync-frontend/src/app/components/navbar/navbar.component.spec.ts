import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { provideRouter } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    component.title = 'Dashboard';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Dashboard');
  });

  it('should emit sidebarOpenChange when toggle button clicked', () => {
    const emitSpy = spyOn(component.sidebarOpenChange, 'emit');

    // default sidebarOpen=false => clicking should emit true
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.hamburger');
    button.click();

    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('should reflect aria-expanded based on sidebarOpen', () => {
    component.sidebarOpen = true;
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.hamburger');
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});