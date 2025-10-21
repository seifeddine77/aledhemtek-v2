import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarieDashboardComponent } from './salarie-dashboard.component';

describe('SalarieDashboardComponent', () => {
  let component: SalarieDashboardComponent;
  let fixture: ComponentFixture<SalarieDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalarieDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalarieDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
