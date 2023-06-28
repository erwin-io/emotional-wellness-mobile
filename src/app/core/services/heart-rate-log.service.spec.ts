import { TestBed } from '@angular/core/testing';

import { HeartRateLogService } from './heart-rate-log.service';

describe('HeartRateLogService', () => {
  let service: HeartRateLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeartRateLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
