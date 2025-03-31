import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHistoryComponentComponent } from './payment-history-component.component';

describe('PaymentHistoryComponentComponent', () => {
  let component: PaymentHistoryComponentComponent;
  let fixture: ComponentFixture<PaymentHistoryComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHistoryComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentHistoryComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
