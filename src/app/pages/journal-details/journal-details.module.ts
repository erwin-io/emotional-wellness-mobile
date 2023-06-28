import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JournalDetailsPageRoutingModule } from './journal-details-routing.module';

import { JournalDetailsPage } from './journal-details.page';
import { DateFormatterModule } from 'src/app/component/date-formatter/date-formatter.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JournalDetailsPageRoutingModule,
    DateFormatterModule
  ],
  exports: [JournalDetailsPage],
  declarations: [JournalDetailsPage]
})
export class JournalDetailsPageModule {}
