import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupPageRoutingModule } from './signup-routing.module';

import { MaterialModule } from 'src/app/material/material.module';
import { SignupPage } from './signup.page';
import { PipeModule } from 'src/app/core/pipe/pipe.module';
import { NgxOtpInputModule } from 'ngx-otp-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SignupPageRoutingModule,
    MaterialModule,
    NgxOtpInputModule
  ],
  declarations: [SignupPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SignupPageModule {}
