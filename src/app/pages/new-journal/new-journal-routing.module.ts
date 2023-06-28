import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewJournalPage } from './new-journal.page';

const routes: Routes = [
  {
    path: '',
    component: NewJournalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewJournalPageRoutingModule {}
