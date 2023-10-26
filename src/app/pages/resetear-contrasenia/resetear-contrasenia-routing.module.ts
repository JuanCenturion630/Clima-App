import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResetearContraseniaPage } from './resetear-contrasenia.page';

const routes: Routes = [
  {
    path: '',
    component: ResetearContraseniaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResetearContraseniaPageRoutingModule {}
