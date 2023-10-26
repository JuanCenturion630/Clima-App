import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})

export class GeolocalizacionService {
  public lat:number=0;
  public lon:number=0;

  constructor() {
  }

  async getCoord() {
    const coordenadas = await Geolocation.getCurrentPosition();

    this.lat = coordenadas.coords.latitude;
    this.lon = coordenadas.coords.longitude;

    console.log('Latitud en geolocalizacion.service.ts: ', this.lat);
    console.log('Longitud en geolocalizacion.service.ts: ', this.lon);
  };
}
