import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartupRedirectComponent } from './startup-redirect.component';

describe('StartupRedirectComponent', () => {
  let component: StartupRedirectComponent;
  let fixture: ComponentFixture<StartupRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartupRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartupRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
