import { TestBed } from '@angular/core/testing';

import { HeartRateMonitorService } from './heart-rate-monitor.service';

describe('HeartRateMonitorService', () => {
  let service: HeartRateMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeartRateMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
