import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HeartRateThumbMonitorPage } from './heart-rate-thumb-monitor.page';

const routes: Routes = [
  {
    path: '',
    component: HeartRateThumbMonitorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HeartRateThumbMonitorPageRoutingModule {}
