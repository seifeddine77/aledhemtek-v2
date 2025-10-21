import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarieDialogComponent } from './salarie-dialog.component';

describe('SalarieDialogComponent', () => {
  let component: SalarieDialogComponent;
  let fixture: ComponentFixture<SalarieDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalarieDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalarieDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
