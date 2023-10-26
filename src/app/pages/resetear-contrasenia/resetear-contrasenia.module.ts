import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResetearContraseniaPageRoutingModule } from './resetear-contrasenia-routing.module';

import { ResetearContraseniaPage } from './resetear-contrasenia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResetearContraseniaPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ResetearContraseniaPage]
})
export class ResetearContraseniaPageModule {}
