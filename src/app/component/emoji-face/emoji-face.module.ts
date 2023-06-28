import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EmojiFaceComponent } from './emoji-face.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [EmojiFaceComponent],
  declarations: [EmojiFaceComponent],
})
export class EmojiFaceModule { }
