import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentPaymentsComponent } from './recent-payments.component';

describe('RecentPaymentsComponent', () => {
  let component: RecentPaymentsComponent;
  let fixture: ComponentFixture<RecentPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentPaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
