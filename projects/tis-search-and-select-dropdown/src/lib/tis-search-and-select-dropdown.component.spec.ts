import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TisSearchAndSelectDropdownComponent } from './tis-search-and-select-dropdown.component';

describe('TisSearchAndSelectDropdownComponent', () => {
  let component: TisSearchAndSelectDropdownComponent;
  let fixture: ComponentFixture<TisSearchAndSelectDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TisSearchAndSelectDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TisSearchAndSelectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
