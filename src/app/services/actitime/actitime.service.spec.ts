import { TestBed } from '@angular/core/testing';

import { ActitimeService } from './actitime.service';

describe('ActitimeService', () => {
  let service: ActitimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActitimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
