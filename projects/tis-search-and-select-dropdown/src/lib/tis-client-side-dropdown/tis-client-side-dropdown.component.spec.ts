import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TisClientSideDropdownComponent } from './tis-client-side-dropdown.component';

describe('TisClientSideDropdownComponent', () => {
  let component: TisClientSideDropdownComponent;
  let fixture: ComponentFixture<TisClientSideDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TisClientSideDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TisClientSideDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
