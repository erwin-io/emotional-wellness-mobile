import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewJournalPageRoutingModule } from './new-journal-routing.module';

import { NewJournalPage } from './new-journal.page';
import { EmojiFaceSliderModule } from 'src/app/component/emoji-face-slider/emoji-face-slider.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NewJournalPageRoutingModule,
    EmojiFaceSliderModule
  ],
  declarations: [NewJournalPage]
})
export class NewJournalPageModule {}
