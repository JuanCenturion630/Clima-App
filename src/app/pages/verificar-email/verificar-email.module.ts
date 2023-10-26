import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerificarEmailPageRoutingModule } from './verificar-email-routing.module';

import { VerificarEmailPage } from './verificar-email.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerificarEmailPageRoutingModule
  ],
  declarations: [VerificarEmailPage]
})
export class VerificarEmailPageModule {}
