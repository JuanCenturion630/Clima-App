import { Component } from '@angular/core';
import { ClimaService } from 'src/app/services/clima.service';
import { ActivatedRoute } from '@angular/router';
import { RangeCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MenuController } from '@ionic/angular';
//import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-clima',
  templateUrl: './clima.page.html',
  styleUrls: ['./clima.page.scss'],
})

export class ClimaPage {
  clima! : any; //Variable sin tipo en la que se colocan todos los datos de la API.
  lat: number=0; //Latitud del dispositivo.
  long: number=0; //Longitud del dispositivo.
  ahora = new Date();
  hora: string=``;
  minuto: string=``;
  fecha: string=``;
  diaNom: string[] = new Array(8);
  diaDelMes : string[] = new Array(8);
  d:number=0; //Contador
  btnSeleccionado:number=0; //Id de los botones de cambio de clima.
  unidad:string=`metric`; //Parámetro para la API refiriéndose al sistema métrico decimal.
  idioma:string=`es`; //Parámetro para la API refiriéndose al español.
  registro:string=``; //Lleva un registro de cuál fue el último componente que recibió click.

  constructor(private conexClima:ClimaService, private route:ActivatedRoute, 
    private authService:AuthService,private router: Router, 
    private menu: MenuController /*private storage:Storage*/) {
    //#region Recupera las coordenadas de Login, las imprime en consola y obtiene el clima:

    this.lat =+this.route.snapshot.queryParams['lat'];
    this.long =+this.route.snapshot.queryParams['long']; 
    console.log("Latitud en clima.page.ts: " + this.lat);
    console.log("Longitud en clima.page.ts: " + this.long);
    this.btnObtenerClimaGPS();
    //#endregion

    //#region Obtiene día y hora del clima:

    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    //i - now.getDay() - d      - día       - Nº
    //0 - 2            - 2      - martes    - 24
    //1 - 2            - 3      - miércoles - 25
    //2 - 2            - 4      - jueves    - 26
    //3 - 2            - 5      - viernes   - 27
    //4 - 2            - 6      - sábado    - 28
    //5 - 2            - 7 -> 0 - domingo   - 29
    //6 - 2            - 1      - lunes     - 30
    //7 - 2            - 2      - martes    - 31
    
    this.d=this.ahora.getDay(); //Obtengo el número del día en una semana iniciada en domingo.
    for (let i = 0; i < 8; i++) {
      if(i>0) this.d++;
      if(this.d==7) this.d=0;
      this.diaNom[i]=dias[this.d];
      this.diaDelMes[i] = `${this.ahora.getDate()+i}`;
    }
    this.calcularFecha();
    console.log("Día del mes: ",this.diaDelMes[0]); //Aún no encontrada la manera de usar el día del mes sin llegar a 32.
    //#endregion
  }

  //#region Menú

  btnNom: string = 'Cambiar a Fahrenheit';
  sm:string=`ºC`; //Asigna una "ºC" o una "ºF" en función del estado botón "Cambiar a...".
  viento:string=`Km/h`;
  /**
   * 
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
      this.conexClima.getURL_Ciudad(this.buscado,this.unidad,this.idioma).subscribe( 
        (r) => { this.clima=r, console.log(`Respuesta: `,r) });
        console.log(`Métrica: `,this.unidad);
        console.log(`Ejecutó getURL_Ciudad()`);
    } 
    else if(this.registro==`ion-button`) {
      this.conexClima.getURL_Coord(this.lat,this.long,this.unidad,this.idioma).subscribe( 
        (r) => { this.clima=r, console.log(`Respuesta: `,r) });
        console.log(`Métrica: `,this.unidad);
        console.log(`Ejecutó getURL_Coord()`);
    }
  }

  cambiarIdioma() {

  }

  cerrarMenu() {
    this.menu.close();
  }

  /** Cambiar a modo claro:
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
  
  /** Cierra la sesión: 
   * Cierra la página actual y redirige la aplicación a la página de home.
   */
  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['home']);
    this.searchText="";
    this.btnObtenerClimaGPS();
    //window.location.reload();
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
  public results = [...this.ciudades]; //Debe ser obligatoriamente público.

  /** Searchbar - Obtener Clima por Ciudad:
   * En función del texto introducido en la barra de búsqueda se calcula el clima de la ciudad solicitada.
   * @param {any} evento - Variable indefinida para recibir eventos del componente.
   */
  searchText: string = '';
  buscado:string=``;
  sbarObtenerClimaCiudad(evento: any) {
    this.buscado = evento.detail.value;
    if(this.buscado!=``) {
      this.getClimaxCiudad(this.buscado);
      this.registro=`ion-searchbar`;
      console.log(`Resultado de ${this.registro}: `,this.buscado);
    }
    else
      console.log("Se ha detectado un espacio en blanco en la barra de búsqueda.");
  }

  /** Seatchbar - Filtrar un Elemento:
   * En función del texto colocado en la barra de búsqueda filtra entre la lista de sugerencias.
   * 
   * Ejemplo: el método recibe una "L" en formato ionInputEvent, lo filtra por tipo (.target), obtiene su 
   * valor (.value), y pasa a minúscula (.toLowerCase()). A continuación se utiliza .filter para recorrer el 
   * vector "ciudades" y comparar cada elemento (c) con `query` ("L"). IndexOf se utiliza para obtener el índice de
   * la "L" encontrada, sino se encontró "L" devuelve -1.
   * 
   * @param {any} evento - Variable indefinida para recibir eventos del componente.
   */
  filtrarElemento(evento:any) {
    const query = evento.target.value.toLowerCase();
    this.results = this.ciudades.filter((c) => c.toLowerCase().indexOf(query) > -1);
  }

  /** Searchbar - Seleccionar elemento de la lista de sugeridos asociada la barra de búsqueda:
   * Un elemento de la lista de ciudades sugeridas se copia al textbox de la barra de búsqueda.
   */
  searchQuery: string = ''; //Texto a copiar del ion-list al ion-searchbar.
  setSearchQuery(selectedValue: string) {
    this.searchQuery = selectedValue;
  }

  /** No funciona 
   * Detecta la tecla entender para invocar un método del sistema. "===" compara si dos valores son iguales y responde
   * "true" o "false", en este caso, si las teclas que fueron presionados al estar en el ion-searchbar es un Enter.
   * @param event 
   */
  detectarEnter(event: any) {
    if (event.detail.inputType === 'insertLineBreak')
      this.handleEnterKeyPress();
  }

  /** No es invocado
   * Implementación de método del sistema.
   */
  handleEnterKeyPress() {
    console.log('Se presionó Enter en el ion-searchbar.');
  }

  /** Searchbar - Lista de Recomendados Visible/Invisible:
   * Muestra la lista de elementos sugeridos en la barra de búsqueda de la página.
   */
  listaVisible: boolean = false;
  mostrarLista() {
    this.listaVisible = !this.listaVisible;
  }

  /** Searchbar - Obtener Clima por Ciudad:
   * Conecta con la API OpenWeatherMap y obtiene datos sobre temperatura, viento y humedad.
   * @param {string} nomCiudad 
   */
  getClimaxCiudad(nomCiudad: string){
    this.conexClima.getURL_Ciudad(nomCiudad,this.unidad,this.idioma).subscribe( //Evaluar por qué no funciona el "suscribe".
      (r) => { this.clima=r, console.log(`Respuesta: `,r) },
      (e) => console.error(`Error: `,e)
    );
  }
  //#endregion

  //#region Botón GPS:

  /** Botón GPS - Obtener Clima por Coordenadas en Celsius.
   * Impacta en la API enviando latitud y longitud y recibe información de la temperatura, viento y humedad. 
   */
  btnObtenerClimaGPS() {
    this.conexClima.getURL_Coord(this.lat,this.long,this.unidad,this.idioma).subscribe(
      (r) => { this.clima=r, console.log(`Respuesta: `,r) },
      (e) => console.error(`Error: `,e)
    );
    this.registro=`ion-button`;
  }
  //#endregion

  //#region Calcular Fecha:

  calcularFecha() {
    this.hora = String(this.ahora.getHours()).padStart(2, '0');
    this.minuto = String(this.ahora.getMinutes()).padStart(2, '0');
    this.fecha = `${this.diaNom[0]} ${this.diaDelMes[0]}, ${this.hora}:${this.minuto}`;
  }
  //#endregion

  //#region Botón Cº y Fº según GPS y según contenido del ion-searchbar:


  //#endregion

  //#region Ion-Range:

  /** Ion-Range - Cambiar Hora
   * En función de la posición del botón del ion-range (.detail.value) se deseaba impactar contra la API, sin embargo
   * no se puedo por la privatización de la función de clima horario de la misma. En su defecto, se dejará el esqueleto
   * de cómo habría funcionado.
   */
  h:number=0;
  onIonChange(ev: Event) {
    this.h=Number((ev as RangeCustomEvent).detail.value);
    if(Number(this.hora)>23) {
      this.h=0;
      this.hora = String(0).padStart(2, '0');
      this.fecha = `${this.diaNom[this.btnSeleccionado]}, ${this.hora}:${this.minuto}`;
    }
    else {
      this.h++;
      this.hora = String(this.h.toString()).padStart(2, '0');
      this.fecha = `${this.diaNom[this.btnSeleccionado]}, ${this.hora}:${this.minuto}`;
    }
    console.log("Ion-range: ",this.h);
    console.log("Hora: ",this.hora);
    console.log("Fecha: ",this.fecha);
  }
  //#endregion

  //#region Botones de Día por Clima:

  /** Cambiar el Clima según el botón de fecha a elección.
   * En función del índice recibido como parámetro se establece la variable "btnSeleccionado" que es fundamental
   * en clima.page.html para usarse como índice para navegar entre los vectores proporcionados por la API.
   * Adicionalmente se reescribe la fecha.
   * @param {number} indice - "id" de cada botón. 
   */
  cambiarClima(indice: number) {
    this.btnSeleccionado = indice;
    this.fecha = `${this.diaNom[this.btnSeleccionado]} ${this.diaDelMes[this.btnSeleccionado]}, ${this.hora}:${this.minuto}`;
  }
  //#endregion
}