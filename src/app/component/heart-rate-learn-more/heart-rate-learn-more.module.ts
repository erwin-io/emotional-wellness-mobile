import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeartRateLearnMoreComponent } from './heart-rate-learn-more.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';



@NgModule({
  imports: [
    CommonModule, FormsModule, IonicModule
  ],
  exports: [HeartRateLearnMoreComponent],
  declarations: [HeartRateLearnMoreComponent]
})
export class HeartRateLearnMoreModule { }
