import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HeartRateThumbMonitorPage } from './heart-rate-thumb-monitor.page';

describe('HeartRateThumbMonitorPage', () => {
  let component: HeartRateThumbMonitorPage;
  let fixture: ComponentFixture<HeartRateThumbMonitorPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeartRateThumbMonitorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HeartRateThumbMonitorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
