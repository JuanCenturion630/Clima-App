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
  registro:string=`ion-button`; //Lleva un registro de cuál fue el último componente que recibió click.
  iconURL:string=''; //Recibe iconos de la API.

  constructor(private conexClima:ClimaService, private route:ActivatedRoute, 
    private authService:AuthService,private router: Router, 
    private menu: MenuController,private alertController: AlertController /*private storage:Storage*/) {
    //#region Recupera las coordenadas de Login, las imprime en consola y obtiene el clima:

    this.lat =+this.route.snapshot.queryParams['lat'];
    this.long =+this.route.snapshot.queryParams['long']; 
    console.log("Latitud en clima.page.ts: " + this.lat);
    console.log("Longitud en clima.page.ts: " + this.long);
    this.btnClimaActual(this.registro);
    //#endregion
  }

  //#region Botón Clima Hora Actual:
  
  nomBtnClimaActual:string=`CALCULAR CLIMA ACTUAL`;
  estadoBtnClimaActual:boolean=false; //En función de su estado se imprime en pantalla "clima": vector de 40 posiciones, o "climaActual": un único valor, por limitaciones de la API gratuita.
  /**
   * @function climaHoraActual - en función del registro calcula el clima de la hora actual a través de la ciudad buscada o las coordenadas.
   */
  btnClimaActual(registro:string) {
    //Cambia las etiquetas y estado del botón CALCULAR CLIMA ACTUAL:
    if(this.nomBtnClimaActual==`CALCULAR CLIMA ACTUAL`) {
      this.nomBtnClimaActual=`CALCULAR CLIMA POR INTERVALOS`;
      this.estadoBtnClimaActual=true;
    }
    else {
      this.nomBtnClimaActual=`CALCULAR CLIMA ACTUAL`;
      this.estadoBtnClimaActual=false;
    }

    //En función del último componente presionado, obtiene clima por GPS o nombre de ciudad.
    if(registro==`ion-button`) {
      this.btnObtenerClimaGPS(this.lat,this.long,this.unidad,this.idioma);
    }
    else {
      this.sbarObtenerClimaCiudad(this.ciudadEscrita);
    }
  }
  //#endregion

  //#region Botón GPS:

  /**
   * @function btnObtenerClimaGPS - Envía parámetros a la API y recibe información del clima.
   * @param {number} lat - latitud.
   * @param {number} long - longitud.
   * @param {string} unidad - unidad de medición: métrico o imperial.
   * @param {string} idioma - español o inglés.
   */
  btnObtenerClimaGPS(lat:number,long:number,unidad:string,idioma:string) {
    //JSON del clima por intervalos de 3 horas por 5 días (12:00, 15:00, 18:00, 21:00, 00:00...):
    this.conexClima.getURL_Coord(lat,long,unidad,idioma).subscribe({
      next: (r) => { 
        this.clima=r;
        console.log(`Se obtuvo clima por intervalos y coordenadas: `,r);
      },
      error: (e) => {
        console.error(`No se pudo obtener clima por intervalos y coordenadas: `,e)
      }
    });

    //JSON del clima en la hora actual:
    this.conexClima.getURL_Coord_HoraActual(lat,long,unidad,idioma).subscribe({
      next: (r) => { 
        this.climaActual=r;
        console.log(`Se obtuvo clima por hora actual y coordenadas: `,r);
      },
      error: (e) => {
        console.log(`No se obtuvo clima por hora actual y coordenadas: `,e);
      }
    });

    this.registro=`ion-button`;
  }
  //#endregion

  //#region Searchbar:

  public ciudades = [ //Búsqueda con resultados predefinidos.
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

  ciudadEscrita: string = ''; //Recibe la ciudad escrita por el usuario en la barra de búsqueda.
  /**
   * @function sbarObtenerClimaCiudad - En función del texto introducido en la barra de búsqueda se calcula el clima de la ciudad solicitada.
   * @param {any} evento - Variable indefinida para recibir eventos del componente.
   */
  sbarObtenerClimaCiudad(buscado:string) {
    if(buscado!=``) {
      this.conexClima.getURL_Ciudad(buscado,this.unidad,this.idioma).subscribe({
        next: (r) => {
          this.clima=r;
          console.log(`Se obtuvo clima por intervalos y ciudad deseada: `,r);
        },
        error: (e) => {
          console.error(`Error ${e.status}. No se obtuvo clima por intervalos y ciudad deseada: `,e);
          if(e.status==404)
            this.alertaError();
          else if(e.status==0)
            this.alertaFallaConexion();
        }
      });

      this.conexClima.getURL_Ciudad_HoraActual(buscado,this.unidad,this.idioma).subscribe({ 
        next: (r) => { 
          this.climaActual=r;
          console.log(`Se obtuvo clima por hora actual y ciudad deseada: `,r);
        },
        error: (e) => {
          console.log(`Error ${e.status}. No se obtuvo clima por hora actual y ciudad deseada: `,e);
          if(e.status==404)
            this.alertaError();
          else if(e.status==0)
            this.alertaFallaConexion();
        }
      });
      this.registro=`ion-searchbar`;
    }
    else {
      console.log("Se ha detectado un espacio en blanco en la barra de búsqueda.");
    }
  }

  /**
   * @function detectarEnter - Detecta la activación de la tecla enter. De hacerlo, oculta la lista de ciudades.
   * Toma el valor de la ciudad ingresada por el usuario y obtiene el clima.
   * @param {KeyboardEvent} event - Evento del componente.
   */
  detectarEnter(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.ciudadEscrita = (event.target as HTMLInputElement).value;
      this.mostrarLista();
      this.sbarObtenerClimaCiudad(this.ciudadEscrita);
    }
  }

  /**
   * @function filtrarElemento - Según el texto en el ion-searchbar filtra entre la lista de sugerencias.
   * @param {any} evento - Variable indefinida para recibir eventos del componente.
   */
  filtrarElemento(evento:any) {
    const buscado = evento.target.value.toLowerCase();
    this.ciudades = this.ciudades.filter((c) => c.toLowerCase().indexOf(buscado) > -1);
  }

  ciudadSugerida: string = ''; //Texto copiado del ion-list al ion-searchbar.
  /**
   * @function copiarCiudadSugerida - Una ciudad sugerida del ion-list se copia al textbox de la barra de búsqueda.
   * @param {string} sugerida - Ciudad sugerida seleccionada.
   */
  copiarCiudadSugerida(sugerida: string) {
    this.ciudadSugerida = sugerida;
  }

  listaVisible: boolean = false;
  /**
   * @function - Determina si el ion-list asociado a la barra de búsqueda se muestra o no.
   */
  mostrarLista() {
    this.listaVisible = !this.listaVisible;
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

  //#region Ion-Range:

  indiceIonRange:number=0; //Posición del "knob" (el pequeño botón que el usuario puede mover por la barra horaria).
  /**
   * @function cambiarHoraClima - Muestra el clima por intervalos de 3 horas (limitación API) en un día.
   * Si el knob y el botón de día seleccionado están en su posición predeterminada (-1 y 0), da el clima actual 
   * llamando otra modalidad de la API.
   * @param {Event} ev - eventos del componente.
   */
  cambiarHoraClima(ev: Event) {
    this.indiceIonRange=Number((ev as RangeCustomEvent).detail.value);
    this.calcularPseudoMatriz(this.btnSeleccionado,this.indiceIonRange);
    console.log("Knob seleccionado en ion-range: ",this.indiceIonRange);
  }
  //#endregion

  //#region Botón de Día por Intervalos (Tarjetas de clima diario):

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

  cci:number=0; //Contador carousel item.
  sumarContador() {
    this.cci++;
    if(this.cci>4) {
      this.cci=0;
    }
    console.log("Se ejecutó sumarContador(): ",this.cci);
  }

  restarContador() {
    this.cci--;
    if(this.cci<0) {
      this.cci=4;
    }
    console.log("Se ejecutó restarContador(): ",this.cci);
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
    
    console.log(`Registro: `,this.registro);
    console.log(`Estado: `,this.estadoBtnClimaActual);

    if(this.registro==`ion-searchbar`&&!this.estadoBtnClimaActual) {
      this.conexClima.getURL_Ciudad(this.ciudadEscrita,this.unidad,this.idioma).subscribe({ 
        next: (r) => { 
          this.clima=r;
          console.log(`Se obtuvo el clima por intervalos y ciudad deseada: `,r);
        },
        error: (e) => {
          console.log(`No se obtuvo el clima por intervalos y ciudad deseada: `,e);
        }
      });
    }
    else {
      this.conexClima.getURL_Coord(this.lat,this.long,this.unidad,this.idioma).subscribe({
        next: (r) => { 
          this.clima=r;
          console.log(`Se obtuvo el clima por intervalos y coordenadas: `,r);
        },
        error: (e) => {
          console.log(`No se obtuvo el clima por intervalos y coordenadas: `,e);
        }
      });
    }

    if(this.registro==`ion-searchbar`&&this.estadoBtnClimaActual) {
      this.conexClima.getURL_Ciudad_HoraActual(this.ciudadEscrita,this.unidad,this.idioma).subscribe({ 
        next: (r) => { 
          this.climaActual=r;
          console.log(`Se obtuvo el clima actual y ciudad deseada: `,r);
        },
        error: (e) => {
          console.log(`No se obtuvo el clima actual y ciudad deseada: `,e);
        }
      });
    }
    else {
      this.conexClima.getURL_Coord_HoraActual(this.lat,this.long,this.unidad,this.idioma).subscribe({
        next: (r) => { 
          this.climaActual=r;
          console.log(`Se obtuvo el clima actual por coordenadas: `,r);
        },
        error: (e) => {
          console.log(`No se obtuvo el clima actual por coordenadas: `,e);
        }
      });
    }
  }

  /**
   * @function cerrarMenu - Cierra el menú desplegable al encabezado de la página del clima.
   */
  cerrarMenu() {
    this.menu.close();
  }

  /** 
   * @function cerrarSesion - Cierra la página actual y redirige la aplicación a la página de home.
   */
  cerrarSesion() {
    this.authService.cerrarSesion(); //Cierra la sesión en Firebase.
    this.router.navigate(['home']); //Redirige la página a home.
    this.ciudadEscrita=""; //Limpia la barra de búsqueda.
    this.btnObtenerClimaGPS(this.lat,this.long,this.unidad,this.idioma); //Recupera el clima en GPS.
  }
  //#endregion
}