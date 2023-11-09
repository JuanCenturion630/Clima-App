import { Component } from '@angular/core';
import { ClimaService } from 'src/app/services/clima.service';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';
declare var locationiq:any; //Declara variables globales que reciben los scripts.
declare var maplibregl:any; //Cada script tiene programado internamente a qué variable global asociarse.
declare var MapboxGeocoder:any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})

export class MapaPage {
  constructor(private climaService:ClimaService, private menuMapa:MenuController, private authService:AuthService,
    private router:Router, private alerta:AlertController) {}

  //#region Mapa:

  navigateToMapaPage() {
    this.router.navigate(['/mapa']); // Navegar a la página de Mapa
  }
  
  ngOnInit() {
    const scriptsURL = [
      'https://tiles.locationiq.com/v3/libs/maplibre-gl/1.15.2/maplibre-gl.js',
      'https://tiles.locationiq.com/v3/js/liq-styles-ctrl-libre-gl.js?v=0.1.8',
      'https://tiles.locationiq.com/v3/libs/gl-geocoder/4.5.1/locationiq-gl-geocoder.min.js?v=0.2.3',
      'https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.min.js',
      'https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js',
    ];

    this.cargarScripts(scriptsURL, () => { //Terminado de cargar scripts, se crea un mapa.
      this.crearMapa();
    });
  }

  cargarScripts(urls: string[], callback: () => void) {
    const scriptsPorCargar = urls.slice();
    const encabezado = document.getElementsByTagName('head')[0]; //Los scripts se ejecutan en la etiqueta <head>.
    const cargarProximoScript = () => {
      if (scriptsPorCargar.length === 0) {
        callback(); //Sino hay scripts llama a una función vacía y cierra el método.
      } else {
        const scriptUrl = scriptsPorCargar.shift();
        if (scriptUrl!=undefined) {
          const etiquetaScript = document.createElement('script'); //Crea una etiqueta <scrip>.
          etiquetaScript.type = 'text/javascript';
          etiquetaScript.src = scriptUrl;
          etiquetaScript.onload = cargarProximoScript; //No continua hasta cargar el script por completo.
          encabezado.appendChild(etiquetaScript); //Inyecta etiqueta <script> en etiqueta <head>
        }
      }
    };
    cargarProximoScript();
  }

  crearMapa() {
    var cuadroClima:HTMLElement|null = document.getElementById('cuadroClima');
    var mapaPage = this; //Guardo una referencia del contexto actual para poder llamar a variables de la clase incluso en las funciones callbacks.
    
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
    //#endregion
        
    //#region Botón GPS:

    //Botón GPS en el mapa (requiere HTTPS... supuestamente)
    var btnGPS=new maplibregl.GeolocateControl({ 
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    });
    mapaInteractivo.addControl(btnGPS);
    
    var intervalo:number=8000;
    btnGPS.on('trackuserlocationstart', function(e:any) {
      console.log("Objeto GPS: ",e);
      ejecutarCadaOchoSeg();
      setTimeout(function() {
        clearInterval(intervalo);
      }, 24000);
    });

    function ejecutarCadaOchoSeg() {
      console.log("btnGPS propiedades: ",btnGPS);
      if (btnGPS._lastKnownPosition!=undefined) {
        var lat = btnGPS._lastKnownPosition.coords.latitude;
        var long = btnGPS._lastKnownPosition.coords.longitude;
        console.log('Coordenadas del dispositivo [latitud, longitud]: ', lat, long);
      
        if(cuadroClima!=null) { //Rellena el cuadro de clima.
          mapaPage.getDireccion(lat,long);
          mapaPage.getClimaActual(lat,long,mapaPage.unidad,mapaPage.idioma);
          cuadroClima.style.display = 'block';
        }
      } else {
        console.log('Siguen calculándose las coordenadas.');
      }
    }
    //#endregion

    //#region Coordenadas:

    let marcadorClicAnterior:any=null;

    //Al hacer clic en la pantalla el marcador se ubica según coordenadas.
    mapaInteractivo.on('click', function(e:any) {
      //Evalúa si hay un marcador anterior y borrarlo.
      if (marcadorClicAnterior!=null) {
        marcadorClicAnterior.remove();
      }

      //Se obtiene coordenadas e imprime el marcador en pantalla según las mismas.
      var marcadorClic=new maplibregl.Marker({color:'red'}).setLngLat(e.lngLat.wrap()).addTo(mapaInteractivo);
      marcadorClicAnterior=marcadorClic;
      
      //Si la etiqueta <div> con ID 'cuadroCoordenadas' existe obtener dirección y clima.
      if(cuadroClima!=null) { 
        mapaPage.getDireccion(e.lngLat.lat,e.lngLat.lng);
        mapaPage.getClimaActual(e.lngLat.lat,e.lngLat.lng,mapaPage.unidad,mapaPage.idioma);
        cuadroClima.style.display = 'block'; //Vuelve visible la etiqueta.
      }
    });
    //#endregion

    //#region Autocompletado:

    //Crea barra de búsqueda con MapboxGeocoder API, llamado por Location IQ API.
    const buscador=new MapboxGeocoder({
      accessToken: locationiq.key,
      mapboxgl: maplibregl, //Biblioteca llamada.
      limit: 5, //Resultados máximos sugeridos.
      dedupe: 1, //Evita elementos repetidos.
      marker: {
        color: 'blue'
      },
      flyTo: { //Animación de desplazamiento cuando se elige ubicación.
        screenSpeed: 7,
        speed: 4
      },
      placeholder: 'Ingrese dirección'
    });
    mapaInteractivo.addControl(buscador, 'top-left');
    
    //Da estilos CSS (por alguna razón no funciona en la página CSS).
    var buscadorComponente:HTMLElement|null = document.querySelector('.mapboxgl-ctrl-geocoder');
    if (buscadorComponente!=null) {
      buscadorComponente.style.width = '295px';
    }

    //Imprime los resultados del buscador en pantalla.
    buscador.on('result', function (e:any) {
      console.log("Sugerencias de barra de búsqueda: ",e);
      var lat = e.result.center[1];
      var long = e.result.center[0];
      
      if(cuadroClima!=null) {
        //Rellena el cuadro de clima.
        mapaPage.getDireccion(lat,long);
        mapaPage.getClimaActual(lat,long,mapaPage.unidad,mapaPage.idioma);
        cuadroClima.style.display = 'block';
      }
    });
    //#endregion
  }
  //#endregion

  //#region Clima:

  climaActual!:any;
  lat:number=0;
  long:number=0;
  unidad:string=`metric`;
  idioma:string=`es`;
  /**
   * @function getClimaActual - obtiene el clima actual en base a parámetros específicos.
   * @param lat - latitud.
   * @param long - longitud.
   * @param unidad - unidad de medición: métrico o imperial.
   * @param idioma - español/inglés.
   */
  getClimaActual(lat:number,long:number,unidad:string,idioma:string) {
    this.climaService.getURL_Coord_HoraActual(lat,long,unidad,idioma).subscribe({
      next: (r) => {
        console.log("Clima en OpenWeather: ",r);
        this.climaActual=r;
        this.lat=lat;
        this.long=long;
      },
      error: (e) => {
        this.notificarError(e);
      }
    })
  }

  geoCodificacionInversa!:any;
  direccion:string=``;
  /**
   * @function getDireccion - obtiene dirección en texto en base a coordenadas.
   * @param lat - latitud.
   * @param long - longitud.
   */
  getDireccion(lat:number,long:number) {
    this.climaService.getGeocodificacionInversa(lat,long).subscribe({
      next: (r) => {
        console.log("Pool de direcciones en Position Stack: ",r);
        this.geoCodificacionInversa=r;
        this.direccion=this.geoCodificacionInversa.data[0].label;
      },
      error: (e) => {
        this.notificarError(e);
      }
    })
  }
  //#endregion

  //#region Notificación de errores:

  /**
   * @function notificarError - muestra mensajes emergentes de error al usuario.
   * @param e - error generado por los métodos suscribe durante el llamado a la API.
   */
  notificarError(e:any) {
    if(e.status==400 || e.status==404 || e.status==422) {
      console.error(`Error ${e.status} (${e.statusText}). No se encontró información del clima.`,e);
      this.alertaNoEncontrado();
    }
    else if(e.status==0) {
      console.log(`Error ${e.status} (${e.statusText}). Ha ocurrido un incidente sin descripción.`,e);
      this.alertaDesconocido();
    }
  }

  /**
   * @function alertaNoEncontrado - Crea un mensaje emergente notificando una búsqueda no encontrada.
   */
  async alertaNoEncontrado() {
    const alert = await this.alerta.create({
      header: 'Error',
      subHeader: 'No se ha encontrado información del clima',
      message: 'Los datos solicitados no se encuentran en nuestro servicio.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * @function alertaDesconocido - Crea un mensaje emergente notificando un error sin descripción.
   */
  async alertaDesconocido() {
    const alert = await this.alerta.create({
      header: 'Error',
      subHeader: 'Ha ocurrido un error desconocido',
      message: 'Espera unos momentos o reinicia la aplicación.',
      buttons: ['OK'],
    });
    await alert.present();
  }
  //#endregion

  //#region Menú:

  btnNom: string = 'Cambiar a Fahrenheit';
  sm:string=`ºC`; //Asigna una "ºC" o una "ºF" en función del estado botón "Cambiar a...".
  viento:string=`Km/h`;
  /**
   * @function sistemaMetrico - En función del botón "Cambiar a..." alterna entre Celsius y Fahrenheit.
   */
  sistemaMetrico() {
    if (this.btnNom == 'Cambiar a Fahrenheit') {
      this.btnNom = 'Cambiar a Celsius';
      this.unidad = `imperial`;
      this.sm = `ºF`;
      this.viento=`mph`;
    } else {
      this.btnNom = 'Cambiar a Fahrenheit';
      this.unidad = `metric`;
      this.sm = `ºC`;
      this.viento=`Km/h`;
    }
    this.getClimaActual(this.lat,this.long,this.unidad,this.idioma);
  }

  /**
   * @function cerrarMenu - Cierra el menú desplegable al encabezado de la página del mapa.
   */
  cerrarMenu() {
    this.menuMapa.close('menuMapa');
  }

  /** 
   * @function cerrarSesion - Cierra la página actual y redirige la aplicación a la página de home.
   */
  cerrarSesion() {
    this.authService.cerrarSesion(); //Cierra la sesión en Firebase.
    this.router.navigate(['home']); //Redirige la página a home.
  }
  //#endregion
}