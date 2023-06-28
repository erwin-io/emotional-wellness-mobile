import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EmojiFaceSliderComponent } from './emoji-face-slider.component';
import { FormsModule } from '@angular/forms';
import { EmojiFaceModule } from '../emoji-face/emoji-face.module';

@NgModule({
  imports: [
    CommonModule, FormsModule, IonicModule, EmojiFaceModule
  ],
  exports: [EmojiFaceSliderComponent],
  declarations: [EmojiFaceSliderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmojiFaceSliderModule { }
