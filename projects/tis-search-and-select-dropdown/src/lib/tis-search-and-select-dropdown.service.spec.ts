import { TestBed } from '@angular/core/testing';

import { TisSearchAndSelectDropdownService } from './tis-search-and-select-dropdown.service';

describe('TisSearchAndSelectDropdownService', () => {
  let service: TisSearchAndSelectDropdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TisSearchAndSelectDropdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
