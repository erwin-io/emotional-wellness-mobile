import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimelinePageRoutingModule } from './timeline-routing.module';

import { TimelinePage } from './timeline.page';
import { MaterialModule } from 'src/app/material/material.module';
import { EmojiFaceModule } from 'src/app/component/emoji-face/emoji-face.module';
import { JournalDetailsPageModule } from '../journal-details/journal-details.module';
import { DateFormatterModule } from 'src/app/component/date-formatter/date-formatter.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MaterialModule,
    TimelinePageRoutingModule,
    EmojiFaceModule,
    JournalDetailsPageModule,
    DateFormatterModule
  ],
  declarations: [TimelinePage]
})
export class TimelinePageModule {}
