import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaulterBillsComponent } from './defaulter-bills.component';

describe('DefaulterBillsComponent', () => {
  let component: DefaulterBillsComponent;
  let fixture: ComponentFixture<DefaulterBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaulterBillsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaulterBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
