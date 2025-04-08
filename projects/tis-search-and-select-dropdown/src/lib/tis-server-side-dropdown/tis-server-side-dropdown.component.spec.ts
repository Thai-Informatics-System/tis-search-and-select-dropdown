import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TisServerSideDropdownComponent } from './tis-server-side-dropdown.component';

describe('TisServerSideDropdownComponent', () => {
  let component: TisServerSideDropdownComponent;
  let fixture: ComponentFixture<TisServerSideDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TisServerSideDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TisServerSideDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
