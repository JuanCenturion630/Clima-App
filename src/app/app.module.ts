import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//Para dar soporte en español a la función Pipe de Angular, que permite formatear los datos Unix de fecha recibidos por la API.
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { ClimaPageModule } from './pages/clima/clima.module';
import { MapaPageModule } from './pages/mapa/mapa.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase), 
    AngularFireAuthModule,
    HttpClientModule,
    ClimaPageModule,
    MapaPageModule,
    FormsModule,
    AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es' } // Agrega esta línea para establecer el idioma en español
  ],
  bootstrap: [AppComponent],
})
export class AppModule { 
  constructor() {
    registerLocaleData(localeEs, 'es'); //Registra los datos de localización para español
  }
}