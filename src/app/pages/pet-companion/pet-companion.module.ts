import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PetCompanionPageRoutingModule } from './pet-companion-routing.module';

import { PetCompanionPage } from './pet-companion.page';
import { MaterialModule } from 'src/app/material/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PetCompanionPageRoutingModule,
    MaterialModule
  ],
  declarations: [PetCompanionPage]
})
export class PetCompanionPageModule {}
