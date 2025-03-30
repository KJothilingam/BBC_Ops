import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillDetailsDialogComponent } from './bill-details-dialog.component';

describe('BillDetailsDialogComponent', () => {
  let component: BillDetailsDialogComponent;
  let fixture: ComponentFixture<BillDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
