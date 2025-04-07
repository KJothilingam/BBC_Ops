import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBillComponent } from './update-bill.component';

describe('UpdateBillComponent', () => {
  let component: UpdateBillComponent;
  let fixture: ComponentFixture<UpdateBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
