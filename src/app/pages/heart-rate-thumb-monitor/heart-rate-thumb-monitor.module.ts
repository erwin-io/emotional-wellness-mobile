import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HeartRateThumbMonitorPageRoutingModule } from './heart-rate-thumb-monitor-routing.module';

import { HeartRateThumbMonitorPage } from './heart-rate-thumb-monitor.page';
import { MaterialModule } from 'src/app/material/material.module';
import { DateFormatterModule } from 'src/app/component/date-formatter/date-formatter.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaterialModule,
    HeartRateThumbMonitorPageRoutingModule,
    DateFormatterModule
  ],
  declarations: [HeartRateThumbMonitorPage]
})
export class HeartRateThumbMonitorPageModule {}
