import { NgModule } from '@angular/core';
import { DateFormatterComponent } from './date-formatter.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';


@NgModule({
  imports: [
    CommonModule, IonicModule
  ],
  exports: [DateFormatterComponent],
  declarations: [DateFormatterComponent]
})
export class DateFormatterModule { }
