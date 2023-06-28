import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { MaterialModule } from 'src/app/material/material.module';
import { EmojiFaceModule } from 'src/app/component/emoji-face/emoji-face.module';

import { NgxEchartsModule } from 'ngx-echarts';
import { TimelinePageModule } from '../timeline/timeline.module';
import { HeartRateLearnMoreModule } from 'src/app/component/heart-rate-learn-more/heart-rate-learn-more.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    MaterialModule,
    EmojiFaceModule,
    HeartRateLearnMoreModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [HomePage]
})
export class HomePageModule {}
