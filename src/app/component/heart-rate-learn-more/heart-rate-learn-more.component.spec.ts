import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HeartRateLearnMoreComponent } from './heart-rate-learn-more.component';

describe('HeartRateLearnMoreComponent', () => {
  let component: HeartRateLearnMoreComponent;
  let fixture: ComponentFixture<HeartRateLearnMoreComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeartRateLearnMoreComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HeartRateLearnMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
