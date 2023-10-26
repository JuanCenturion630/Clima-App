import { Component } from '@angular/core';
import { GeolocalizacionService } from '../services/geolocalizacion.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private conexGeo:GeolocalizacionService) {
    //this.conexGeo.getCoord();
  }
}
