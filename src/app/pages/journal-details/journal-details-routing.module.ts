import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JournalDetailsPage } from './journal-details.page';

const routes: Routes = [
  {
    path: '',
    component: JournalDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JournalDetailsPageRoutingModule {}
