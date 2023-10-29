import { Component } from '@angular/core';
import { ClimaService } from 'src/app/services/clima.service';
import { ActivatedRoute } from '@angular/router';
import { RangeCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MenuController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-clima',
  templateUrl: './clima.page.html',
  styleUrls: ['./clima.page.scss'],
})

export class ClimaPage {
  clima!:any; //Variable sin tipo, recibe datos de la API en modo "5 días/3 horas". Recibe los datos de cinco días divididos en intervalos de tres horas.
  climaActual!:any; //Variable sin tipo, recibe datos de la API en su modo "actual". Recibe los datos de la hora presente.
  lat:number=0; //Latitud del dispositivo.
  long:number=0; //Longitud del dispositivo.
  btnSeleccionado:number=0; //Id de los botones de cambio de clima.
  unidad:string=`metric`; //Parámetro para la API refiriéndose al sistema métrico decimal.
  idioma:string=`es`; //Parámetro para la API refiriéndose al español.
  registro:string=``; //Lleva un registro de cuál fue el último componente que recibió click.
  iconURL:string=''; //Recibe iconos de la API.

  constructor(private conexClima:ClimaService, private route:ActivatedRoute, 
    private authService:AuthService,private router: Router, 
    private menu: MenuController,private alertController: AlertController /*private storage:Storage*/) {
    //#region Recupera las coordenadas de Login, las imprime en consola y obtiene el clima:

    this.lat =+this.route.snapshot.queryParams['lat'];
    this.long =+this.route.snapshot.queryParams['long']; 
    console.log("Latitud en clima.page.ts: " + this.lat);
    console.log("Longitud en clima.page.ts: " + this.long);
    this.btnObtenerClimaGPS();
    //#endregion
  }

  //#region Menú

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
    
    console.log(`Registro: `,this.registro);

    if(this.registro==`ion-searchbar`) {
      this.conexClima.getURL_Ciudad(this.buscado,this.unidad,this.idioma).subscribe({ 
        next: (r) => { 
          this.clima=r;
          console.log(`Éxito en clima.page.ts.sistemaMetrico(ion-searchbar): `,r);
        },
        error: (e) => {
          console.log(`Error en clima.page.ts.sistemaMetrico(ion-searchbar): `,e);
        }
      });
    }
    else if(this.registro==`ion-button`) {
      this.conexClima.getURL_Coord(this.lat,this.long,this.unidad,this.idioma).subscribe({
        next: (r) => { 
          this.clima=r;
          console.log(`Éxito en clima.page.ts.sistemaMetrico(ion-button): `,r);
        },
        error: (e) => {
          console.log(`Error en clima.page.ts.sistemaMetrico(ion-button)`);
        }
      });
    }
  }

  cambiarIdioma() {

  }

  /**
   * @function cerrarMenu - Cierra el menú desplegable al encabezado de la página del clima.
   */
  cerrarMenu() {
    this.menu.close();
  }

  /** Cambiar a modo claro: (NO FUNCIONA)
   * Permite cambiar el color de todos los componentes de la aplicación.
   */
  /*
  setTheme() {
    this.storage.get('theme').then(theme => {
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    });
  }

  toggleTheme() {
    this.storage.get('theme').then(theme => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      document.body.classList.remove(theme + '-theme');
      document.body.classList.add(newTheme + '-theme');
      this.storage.set('theme', newTheme);
    });
  }*/
  
  /** 
   * @function cerrarSesion - Cierra la página actual y redirige la aplicación a la página de home.
   */
  cerrarSesion() {
    this.authService.cerrarSesion(); //Cierra la sesión en Firebase.
    this.router.navigate(['home']); //Redirige la página a home.
    this.searchText=""; //Limpia la barra de búsqueda.
    this.btnObtenerClimaGPS(); //Recupera el clima actual en GPS.
  }
  //#endregion

  //#region Searchbar

  //Rellenar barra de búsqueda con resultados predefinidos:
  private ciudades = [
    'Buenos Aires',
    'La Plata',
    'Rosario',
    'Montevideo',
    'Santiago de Chile',
    'Río de Janeiro',
    'Brasilia',
    'La Paz',
    'Asunción',
    'Lima',
  ];
  public results = [...this.ciudades]; //Debe ser obligatoriamente público ya que se utiliza en HTML.

  /**
   * @function sbarObtenerClimaCiudad - En función del texto introducido en la barra de búsqueda se calcula el clima de la ciudad solicitada.
   * @param {any} evento - Variable indefinida para recibir eventos del componente.
   */
  searchText: string = ''; //Recibe el contenido de la barra de búsqueda en el archivo HTML.
  buscado:string=``;
  sbarObtenerClimaCiudad(evento: any) {
    this.buscado = evento.detail.value;
    if(this.buscado!=``) {
      this.getClimaxCiudad(this.buscado);
      this.registro=`ion-searchbar`;
      console.log(`Resultado de ${this.registro}: `,this.buscado);
    }
    else {
      console.log("Se ha detectado un espacio en blanco en la barra de búsqueda.");
    }
  }

  /**
   * @function filtrarElemento - En función del texto colocado en la barra de búsqueda filtra entre la lista de sugerencias.
   * Ejemplo: el método recibe una "L" en formato ionInputEvent, lo filtra por tipo (.target), obtiene su 
   * valor (.value), y pasa a minúscula (.toLowerCase()). A continuación se utiliza .filter para recorrer el 
   * vector "ciudades" y comparar cada elemento (c) con `query` ("L"). IndexOf se utiliza para obtener el índice de
   * la "L" encontrada, sino se encontró "L" devuelve -1. 
   * @param {any} evento - Variable indefinida para recibir eventos del componente.
   */
  filtrarElemento(evento:any) {
    const query = evento.target.value.toLowerCase();
    this.results = this.ciudades.filter((c) => c.toLowerCase().indexOf(query) > -1);
  }

  searchQuery: string = ''; //Texto copiado al ion-searchbar.
  /**
   * @function searchQuery - Un elemento del ion-list de ciudades sugeridas se copia al textbox de la barra de búsqueda.
   * @param {string} selectedValue - Ciudad sugerida seleccionada.
   */
  setSearchQuery(selectedValue: string) {
    this.searchQuery = selectedValue;
  }

  /**
   * @function detectarEnter - detecta la activación de la tecla enter.
   * @param {any} event - eventos del componente.
   */
  detectarEnter(event: any) {
    if (event.key === "Enter") {
      console.log('Se presionó tecla enter.');
    }
  }

  listaVisible: boolean = false; 
  /**
   * @function - Determina si el ion-list asociado a la barra de búsqueda se muestra o no.
   */
  mostrarLista() {
    this.listaVisible = !this.listaVisible;
  }

  errorEncontrado:any;
  /**
   * @function getClimaxCiudad - Conecta con la API OpenWeatherMap y obtiene datos sobre temperatura, viento y humedad.
   * @param {string} nomCiudad 
   */
  getClimaxCiudad(nomCiudad: string) {
    this.conexClima.getURL_Ciudad(nomCiudad,this.unidad,this.idioma).subscribe({
      next: (r) => {
        this.clima=r;
        console.log(`Éxito al ejecutar getClimaxCiudad en clima.page.ts: `,r);
      },
      error: (e) => {
        this.errorEncontrado=e;
        console.error(`Error ${e.status} al ejecutar getClimaxCiudad en clima.page.ts: `,e);
        if(e.status==404)
          this.alertaError();
        else if(e.status==0)
          this.alertaFallaConexion();
      }
    });
  }

  /**
   * @function alertaError - Crea un mensaje emergente de error para el usuario.
   */
  async alertaError() {
    const alert = await this.alertController.create({
      header: 'Error',
      subHeader: 'No se ha encontrado el elemento',
      message: 'La ciudad solicitada no se encuentra en nuestro servicio.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * @function alertaFallaConexion - Crea un mensaje emergente de error para el usuario.
   */
  async alertaFallaConexion() {
    const alert = await this.alertController.create({
      header: 'Error',
      subHeader: 'Conexión no establecida',
      message: 'Espera unos momentos o revisa tu conexión a internet.',
      buttons: ['OK'],
    });
    await alert.present();
  }
  //#endregion
  
  //#region Botón GPS:

  /**
   * @function btnObtenerClimaGPS - Envía latitud y longitud a la API y recibe información del clima.
   */
  btnObtenerClimaGPS() {
    this.conexClima.getURL_Coord(this.lat,this.long,this.unidad,this.idioma).subscribe({
      next: (r) => { 
        this.clima=r;
        console.log(`Éxito al ejecutar btnObtenerClimaGPS(): `,r);
      },
      error: (e) => console.error(`Error al ejecutar btnObtenerClimaGPS(): `,e)
    });
    this.registro=`ion-button`;
  }
  //#endregion

  //#region Ion-Range:

  indiceIonRange:number=0; //Posición del "knob" (el pequeño botón que el usuario puede mover por la barra).
  /**
   * @function cambiarHoraClima - Muestra el clima por intervalos de 3 horas (limitación API) en un día.
   * @param {Event} ev - eventos del componente.
   */
  cambiarHoraClima(ev: Event) {
    this.indiceIonRange=Number((ev as RangeCustomEvent).detail.value)-1;
    if(this.indiceIonRange>-1) {
      this.calcularPseudoMatriz(this.btnSeleccionado,this.indiceIonRange);
    }
    console.log("Knob seleccionado en ion-range: ",this.indiceIonRange);
  }

  /**
   * @function cambiarHoraClimaKnob0 - Cuando el Knob este en primera posición, obtiene el clima actual. 
   * Según el registro del último control usado, la API se activa con unos parámetros u otros.
   */
  cambiarHoraClimaKnob0() {
    if(this.registro==`ion-button`) {
      this.conexClima.getURL_Coord_HoraActual(this.lat,this.long,this.unidad,this.idioma).subscribe({
        next: (r) => {
          this.climaActual=r;
          console.log(`Éxito al ejecutar cambiarClimaKnob0(ion-button) y recibir datos de API: `,r);
        },
        error: (e) => {
          console.log(`Error al ejecutar cambiarClimaKnob0(ion-button), no se conectó con la API: `,e);
        }
      });
    }
    else if(this.registro==`ion-searchbar`) {
      this.conexClima.getURL_Ciudad_HoraActual(this.buscado,this.unidad,this.idioma).subscribe({
        next: (r) => {
          this.climaActual=r;
          console.log(`Éxito al ejecutar cambiarClimaKnob0(ion-searchbar) y recibir datos de API: `,r);
        },
        error: (e) => {
          console.log(`Error al ejecutar cambiarClimaKnob0(ion-searchbar), no se conectó con la API: `,e);
        }
      });
    }
  }
  //#endregion

  //#region Botones de Día (Tarjetas de clima por día):

  indicePseudoMatriz:number=0; //Debido a que la API devuelve un vector gigante, se ha tratado como matriz.
  /**
   * @function calcularPseudoMatriz - Trata al vector de 40 posiciones como si se tratara de una matriz de 5 x 8. 5 días y 8 intervalos horarios diarios.
   * @param {number} fila - representa al número de días.
   * @param {number} columna - representa al número de intervalos horarios en un día (12:00, 15:00, 18:00, 21:00... etc).
   */
  calcularPseudoMatriz(fila: number, columna: number) {
    if (fila >= 0 && fila < 5 && columna >= 0 && columna < 8) {
      this.indicePseudoMatriz = fila * 8 + columna;
    }
  }
  
  /** 
   * @function cambiarClima - Cambia el clima en función del botón de clima (día) y el knob seleccionado en el ion-range (hora).
   * @param {number} indice - "id" de cada botón. 
   */
  cambiarClima(indice: number) {
    this.btnSeleccionado = indice;
    this.calcularPseudoMatriz(indice,this.indiceIonRange);
  }
  //#endregion
}