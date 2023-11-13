import { Component, OnInit } from '@angular/core';
import { ClimaService } from 'src/app/services/clima.service';
import { ActivatedRoute } from '@angular/router';
import { RangeCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MenuController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-clima',
  templateUrl: './clima.page.html',
  styleUrls: ['./clima.page.scss'],
})

export class ClimaPage implements OnInit {
  clima!:any; //Recibe datos de la API climática en modo "5 días/3 horas". Recibe los datos de cinco días divididos en intervalos predefinidos de tres horas.
  climaActual!:any; //Recibe datos de la API climática en su modo "actual". Recibe los datos de la hora presente.
  geoCodificacion!:any; //Recibe datos de la API de geocodificación, convierte direcciones en coordenadas.
  lat:number=0; //Latitud.
  long:number=0; //Longitud.
  unidad:string=`metric`; //Parámetro para la API climática refiriéndose al sistema métrico decimal.
  idioma:string=`es`; //Parámetro para la API climática refiriéndose al español.
  registro:string=`ion-button`; //Lleva un registro de cuál fue el último componente que recibió clic.
  iconURL:string=''; //Recibe iconos de la API climática.

  constructor(private climaService:ClimaService, private route:ActivatedRoute, private authService:AuthService,
    private router:Router, private menu:MenuController, private alerta:AlertController, 
    private firestore:FirestoreService) {
    
    //#region Recupera las coordenadas de Login, las imprime en consola y obtiene el clima:

    this.lat =+this.route.snapshot.queryParams['lat'];
    this.long =+this.route.snapshot.queryParams['long']; 
    console.log("Latitud en clima.page.ts: " + this.lat);
    console.log("Longitud en clima.page.ts: " + this.long);
    this.btnClimaActual(this.registro);
    //#endregion
  }

  /**
   * @function ngOnInit - se ejecuta como primer método de la página luego del constructor.
   */
  ngOnInit() {
    const uid: string = localStorage.getItem('uid') || "";
    if(uid != ""){
      this.firestore.getUsuario(uid).subscribe((data) => {
        const usuarioData: any = data.payload.data();
        if (usuarioData) {
          this.ciudades = usuarioData.ciudadesFavoritas;
        }
      });
    }
  }

  //#region Notificación de errores:

  /**
   * @function notificarError - muestra mensajes emergentes de error al usuario.
   * @param e - error generado por los métodos suscribe durante el llamado a las APIs.
   */
  notificarError(e:any) {
    if(e.status==400 || e.status==404 || e.status==422) {
      console.error(`Error ${e.status} (${e.statusText}). No se encontraron resultados.`,e);
      this.alertaNoEncontrado();
    }
    else if(e.status==0) {
      console.log(`Error ${e.status} (${e.statusText}). No es posible describir el error.`,e);
      this.alertaDesconocido();
    }
  }

  /**
   * @function alertaNoEncontrado - Crea un mensaje emergente notificando una búsqueda no encontrada.
   */
  async alertaNoEncontrado() {
    const alert = await this.alerta.create({
      header: 'Error',
      subHeader: 'No se ha encontrado el elemento',
      message: 'Los datos solicitados no se encuentran en nuestro servicio.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * @function alertaFallaConexion - Crea un mensaje emergente notificando la ausencia de conexión.
   */
  async alertaDesconocido() {
    const alert = await this.alerta.create({
      header: 'Error',
      subHeader: 'Error desconocido',
      message: 'No es posible describir la identidad del error. Recargue la aplicación.',
      buttons: ['OK'],
    });
    await alert.present();
  }
  //#endregion

  //#region Botón Clima Hora Actual:
  
  nomBtnClimaActual:string=`CALCULAR CLIMA ACTUAL`;
  estadoBtnClimaActual:boolean=false; //En función de su estado se imprime en pantalla "clima": vector de 40 posiciones, o "climaActual": un único valor (limitaciones de la API gratuita).
  /**
   * @function btnClimaActual - en función del registro calcula el clima de la hora actual a través de la dirección/ciudad o las coordenadas.
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

    //En función del último componente presionado, obtiene clima por GPS o por dirección/nombre de ciudad.
    if(registro==`ion-button`) {
      this.obtenerClimaCoord(this.lat,this.long,this.unidad,this.idioma);
    }
    else {
      this.sbarObtenerClimaCiudad(this.ciudadEscrita);
    }
  }
  //#endregion

  //#region Botón GPS:

  /**
   * @function btnGPS - obtiene las coordenadas del dispositivo.
   * @param {string} unidad - unidad de medición: métrico o imperial.
   * @param {string} idioma - español/inglés.
   */
  async btnGPS(unidad:string,idioma:string) {
    const ubicacion = await Geolocation.getCurrentPosition();
    let lat = ubicacion.coords.latitude;
    let long = ubicacion.coords.longitude;
    this.obtenerClimaCoord(lat,long,unidad,idioma);
  }

  /** 
   * @function obtenerClimaCoord - Envía coordenadas de varias direcciones a la API y recibe datos del clima.
   * @param {number} lat - latitud.
   * @param {number} long - longitud.
   * @param {string} unidad - unidad de medición: métrico o imperial.
   * @param {string} idioma - español o inglés.
   */
  obtenerClimaCoord(lat:number,long:number,unidad:string,idioma:string) {
    try {
      //JSON del clima por intervalos predefinidos de 3 horas por 5 días (12:00, 15:00, 18:00, 21:00, 00:00...):
      if(this.clima==undefined) { //Si los intervalos aún no son cargados, se ejecuta llamada a la API.
        this.climaService.getURL_Coord(lat,long,unidad,idioma).subscribe({
          next: (r) => {
            this.clima=r;
            console.log(`Se obtuvo clima por intervalos y coordenadas: `,r);
          },
          error: (e) => {
            this.notificarError(e);
          }
        });
      } //Si ya hay datos en "clima" se los compara con los nuevos parámetros en el segundo ejecución del método.
      else if(this.lat==lat&&this.long==long&&this.unidad==unidad&&this.idioma==idioma) {
        console.log(`Clima por intervalos ya esta cargado con estas coordenadas, unidad de medición e idioma. No hubo nuevo llamado a la API.`);
      }
      else { //Si clima no es indefinido y no se repitieron parámetros de una búsqueda previa, realiza nuevo llamado.
        this.climaService.getURL_Coord(lat,long,unidad,idioma).subscribe({
          next: (r) => {
            this.clima=r;
            console.log(`Se obtuvo clima por intervalos y coordenadas: `,r);
          },
          error: (e) => {
            this.notificarError(e);
          }
        });
      }

      //Guarda coordenadas de la última llamada al método, para compararlo con la próxima llamada.
      this.lat=lat;
      this.long=long;

      //JSON del clima en la hora actual (este se actualiza siempre que el usuario lo quiera):
      this.climaService.getURL_Coord_HoraActual(lat,long,unidad,idioma).subscribe({
        next: (r) => { 
          this.climaActual=r;
          console.log(`Se obtuvo clima por hora actual y coordenadas: `,r);
        },
        error: (e) => {
          this.notificarError(e);
        }
      });

      this.ciudadEscrita=``; //Limpia la barra de búsqueda.
      this.registro=`ion-button`;
    }
    catch(error) {
      console.log(error);
    }
  }
  //#endregion

  //#region Searchbar:

  ciudadEscrita: string = ''; //Recibe la ciudad escrita por el usuario en la barra de búsqueda.
  public ciudades = [ //Sugerencias para la lista de la barra de búsqueda.
    'Buenos Aires',
    'La Plata',
    'Rosario',
    'Montevideo',
    'Santiago de Chile',
    'Río de Janeiro',
    'Brasilia',
    'La Paz',
    'Asunción',
    'Lima'
  ];

  /**
   * @function sbarObtenerClimaCiudad - En función del texto en la barra de búsqueda se calcula el clima solicitada.
   * @param {any} evento - Variable indefinida para recibir eventos del componente.
   */
  sbarObtenerClimaCiudad(buscado:string) {
    if(buscado!=``) {
      console.log("Texto colocado en la barra de búsqueda: ",buscado.toLowerCase().trim().replace(/\b\w/g, (match) => match.toUpperCase()));
      this.climaService.getGeocodificacion(buscado.toLowerCase().trim()).subscribe({
        next: (r) => {
          this.geoCodificacion=r;
          console.log("API Position Stack: ",this.geoCodificacion);
          if(this.geoCodificacion.data[0]!=undefined) {
            this.obtenerClimaCoord(this.geoCodificacion.data[0].latitude,this.geoCodificacion.data[0].longitude,
              this.unidad,this.idioma);
            /*Si la dirección fue encontrada, se guarda como sugerido:
              removiendo todos los espacios en blanco del principio y final del string (.trim())
              y convirtiendo a la primera letra de todas las palabras del strin en mayúsculas (.replace())*/
            let buscadoFormateado:string=buscado.trim().replace(/\b\w/g, (match) => match.toUpperCase());
            this.guardarEnFirebase(buscadoFormateado);
          }
          else {
            this.alertaNoEncontrado();
          }
        },
        error: (e) => {
          this.notificarError(e);
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
   * @function guardarEnFirebase - guarda los elementos favoritos del ion-list en Firebase.
   * @param {string} elemento - sugerencia favorita.
   */
  guardarEnFirebase(elemento:string) {
    let listaSugeridos = this.ciudades.map(ciudad => ciudad.toLowerCase());
    if (!listaSugeridos.includes(elemento)) {
      const uid: string = localStorage.getItem('uid') || ""; //ID del elemento en Firebase.
      if (uid != "") {
        const ciudadNueva = elemento.charAt(0).toUpperCase() + elemento.slice(1).toLowerCase();
        if (!this.ciudades.includes(ciudadNueva)) { //Verificar si la ciudad nueva ya está en la lista.
          this.ciudades.unshift(ciudadNueva); //Insertar nuevo valor al inicio de la lista "ciudades".
          if (this.ciudades.length > 10) { //Si "ciudades" tiene más de 10 elementos, quitar el último.
            this.ciudades.pop();
          }
          let actualizados = {
            ciudadesFavoritas: this.ciudades
          }
          this.firestore.actualizarUsuario(uid, actualizados);
        }
      }
    }
  }

  borrarDeFirebase() {

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

  busquedas: { nombre: string, icono: string, color: string } [] = [
    {nombre:'Buenos Aires',icono:'star',color:'#00c3ff'},
    {nombre:'La Plata',icono:'star',color:'#00c3ff'},
    {nombre:'Rosario',icono:'star',color:'#00c3ff'},
    {nombre:'Montevideo',icono:'star',color:'#00c3ff'},
    {nombre:'Santiago de Chile',icono:'star',color:'#00c3ff'},
    {nombre:'Río de Janeiro',icono:'star',color:'#00c3ff'},
    {nombre:'Brasilia',icono:'star',color:'#00c3ff'},
    {nombre:'La Paz',icono:'star',color:'#00c3ff'},
    {nombre:'Asunción',icono:'star',color:'#00c3ff'},
    {nombre:'Lima',icono:'star',color:'#00c3ff'}
  ];
  /**
   * @function cambiarIcono - cambia icono y color del botón "Favoritos" en función del evento mouse iniciado.
   */
  cambiarIcono(nombre:string,icono:string) {
    //De todo el vector "busquedas" obtengo solo los iguales al parámetro "nombre" (único valor).
    const busqActual = this.busquedas.find(item => item.nombre == nombre);
    if (busqActual) { 
      /** Al valor único "busqActual.icono" le asignó el parámetro "icono": si "icono"=="trash" es true,
       * lo cambio por "star", si es false cambiarlo a "trash", de facto, dejarlo igual.
       * 
       * A "busqActual.color" le asignó el parámetro "icono": si "icono"=="trash" es true, lo cambio por 
       * celeste en hexadecimal, si es false cambiarlo a rojo en hexadecimal. 
       */
      busqActual.icono = icono == 'trash' ? 'star' : 'trash';
      busqActual.color = icono == 'trash' ? '#00c3ff' : '#ff0000';
    }
  }
  //#endregion

  //#region Ion-Range (barra de horas):

  indiceIonRange:number=0; //Posición del "knob" (el pequeño botón que el usuario puede mover por la barra horaria).
  /**
   * @function cambiarHoraClima - Muestra el clima por intervalos de 3 horas (limitación API) en un día.
   * Si el knob y el botón de día seleccionado están en su posición predeterminada (-1 y 0), da el clima actual 
   * llamando otra modalidad de la API.
   * @param {Event} ev - eventos del componente.
   */
  cambiarHoraClima(ev: Event) {
    this.indiceIonRange=Number((ev as RangeCustomEvent).detail.value);
    this.calcularPseudoMatriz(this.cci,this.indiceIonRange);
    console.log("Knob seleccionado en ion-range: ",this.indiceIonRange);
  }
  //#endregion

  //#region Botón de Día por Intervalos (Tarjetas de clima diario):

  indicePseudoMatriz:number=0; //Debido a que la API devuelve un vector gigante, se ha tratado como matriz.
  /**
   * @function calcularPseudoMatriz - Trata al vector de 40 posiciones como una matriz de 5 x 8. 5 días, 8 intervalos.
   * @param {number} fila - representa al número de días.
   * @param {number} columna - representa al número de intervalos horarios en un día (12:00, 15:00, 18:00... etc).
   */
  calcularPseudoMatriz(fila: number, columna: number) {
    if (fila >= 0 && fila < 5 && columna >= 0 && columna < 8) {
      this.indicePseudoMatriz = fila * 8 + columna;
    }
  }
  
  /** Método descartado, tal vez futuramente reutilizado...
   * @function cambiarClima - Cambia el clima en función del botón de clima (día) y el knob seleccionado en el ion-range (hora).
   * @param {number} indice - "id" de cada botón. 
   *
  cambiarClima(indice: number) {
    this.btnSeleccionado = indice;
    this.calcularPseudoMatriz(indice,this.indiceIonRange);
  }*/

  cci:number=0; //Contador carousel item (representa las filas de la pseudomatriz {slide clima día 1, 2, etc...}).
  /**
   * @function sumarContador - incrementa un contador que sirve como índice de los botones de clima por día.
   */
  sumarContador() {
    this.cci++;
    if(this.cci>4) {
      this.cci=0;
    }
    this.calcularPseudoMatriz(this.cci,this.indiceIonRange);
  }

  /**
   * @function restarContador - decrementa un contador que sirve como índice de los botones de clima por día.
   */
  restarContador() {
    this.cci--;
    if(this.cci<0) {
      this.cci=4;
    }
    this.calcularPseudoMatriz(this.cci,this.indiceIonRange);
  }

  /**
   * @function setContador - establece el valor del contador para su uso en los carousel-indicators de Bootstrap. 
   */
  setContador(set:number) {
    if(set>=0 && set<5) {
      this.cci=set;
    }
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

    if(this.registro==`ion-searchbar`) {
      this.sbarObtenerClimaCiudad(this.ciudadEscrita);
    }
    else {
      this.obtenerClimaCoord(this.lat,this.long,this.unidad,this.idioma);
    }
  }

  /**
   * @function cerrarMenu - Cierra el menú desplegable al encabezado de la página del clima.
   */
  cerrarMenu() {
    this.menu.close('menuClima');
  }

  /** 
   * @function cerrarSesion - Cierra la página actual y redirige la aplicación a la página de home.
   */
  cerrarSesion() {
    this.authService.cerrarSesion(); //Cierra la sesión en Firebase.
    this.router.navigate(['home']); //Redirige la página a home.
    this.registro='ion-button';
  }
  //#endregion
}