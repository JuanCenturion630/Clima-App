import { Component } from '@angular/core';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
declare var maplibregl: any; // Declara la variable global que toma script de HTML.
declare var locationiq: any; // Declara la variable global que toma script de HTML.

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage {

  constructor() {}

  ionViewDidEnter() {
    console.log("Entró en ionView");
    let cuadroCoordenadas:HTMLElement|null = document.getElementById('cuadroCoordenadas');
    //#region Declara un mapa:
    
    locationiq.key = 'pk.bf65017ca2656c90bf3cbe89134b922a'; //Clave de mi cuenta en Location IQ.
    var mapaInteractivo = new maplibregl.Map({
        container: 'mapa', //Declara el ID de la etiqueta HTML donde se invocará el mapa.
        style: locationiq.getLayer("Streets"), //Estética del mapa.
        zoom: 12, //Zoom del mapa.
        center: [-58.43311609999978, -34.65035907412971] //Longitud y latitud de la que inicia el mapa.
    });
    //#endregion

    //#region Controles básicos:

    //Agrega botones "aumentar/reducir zoom y girar mapa"
    var botones = new maplibregl.NavigationControl();
    mapaInteractivo.addControl(botones, 'top-right');
    
    //Barra para representar la escala del mapa.
    mapaInteractivo.addControl(new maplibregl.ScaleControl({
      maxWidth: 80,
      unit: 'metric' //Km
    }));
        
    //Botón GPS en el mapa (requiere HTTPS... supuestamente)
    mapaInteractivo.addControl(new maplibregl.GeolocateControl({ 
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }));
    //#endregion

    //#region Coordenadas:

    //Se declara marcador en pantalla como si fuera una etiqueta "div".
    var marcador = document.createElement('div');
    marcador.className = 'marcadorEstetica';
    marcador.style.backgroundImage = 'url(https://tiles.locationiq.com/static/images/marker50px.png)';
    marcador.style.width = '50px';
    marcador.style.height = '50px';

    //Al hacer clic en la pantalla el marcador se ubica según coordenadas.
    mapaInteractivo.on('click', function(e:any) {
      console.log("entró en click");
      //Se obtiene coordenadas e imprime el marcador en pantalla según las mismas.
      var posicionarMarcador = new maplibregl.Marker(marcador).setLngLat(e.lngLat.wrap()).addTo(mapaInteractivo);
      //Se transfieren coordenadas.
      var long_lat = posicionarMarcador.getLngLat();
      //Crea cuadro de texto en pantalla.
      if(cuadroCoordenadas!=null) {
        cuadroCoordenadas.style.display = 'block';
        //Rellena ese cuadro de texto con las coordenadas.
        cuadroCoordenadas.innerHTML = 'Latitud: ' + long_lat.lat + '<br />Longitud: ' + long_lat.lng;
      }
    });
    //#endregion

    //#region Autocompletado:

    mapaInteractivo.addControl(new MapboxGeocoder({
      accessToken: locationiq.key,
      mapboxgl: maplibregl,
      limit: 5, //Resultados máximos sugeridos.
      /*dedupe: 1,
      marker: {
        color: 'red'
      },*/
      flyTo: {
        screenSpeed: 7,
        speed: 4
      },
      placeholder: 'Ingrese dirección'
    }), 'top-left');

    mapaInteractivo.on('geocoder.result', function(e:any) {
      console.log("entró en geocoder.result");
      //Se obtiene coordenadas e imprime el marcador en pantalla según las mismas.
      var posicionarMarcador = new maplibregl.Marker(marcador).setLngLat(e.lngLat.wrap()).addTo(mapaInteractivo);
      //Se transfieren coordenadas.
      var long_lat = posicionarMarcador.getLngLat();
      //Crea cuadro de texto en pantalla.
      if(cuadroCoordenadas!=null) {
        cuadroCoordenadas.style.display = 'block';
        //Rellena ese cuadro de texto con las coordenadas.
        cuadroCoordenadas.innerHTML = 'Latitud: ' + long_lat.lat + '<br />Longitud: ' + long_lat.lng;
      }
    });
    //#endregion
  }
}
