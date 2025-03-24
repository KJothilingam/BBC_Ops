import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateBillComponent } from './generate-bill.component';

describe('GenerateBillComponent', () => {
  let component: GenerateBillComponent;
  let fixture: ComponentFixture<GenerateBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
