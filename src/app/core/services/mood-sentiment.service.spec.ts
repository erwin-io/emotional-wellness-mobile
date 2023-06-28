import { TestBed } from '@angular/core/testing';

import { MoodSentimentService } from './mood-sentiment.service';

describe('MoodSentimentService', () => {
  let service: MoodSentimentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoodSentimentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
