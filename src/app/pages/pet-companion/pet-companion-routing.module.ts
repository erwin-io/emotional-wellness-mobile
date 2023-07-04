import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PetCompanionPage } from './pet-companion.page';

const routes: Routes = [
  {
    path: '',
    component: PetCompanionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PetCompanionPageRoutingModule {}
