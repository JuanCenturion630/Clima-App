import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {
  paginaActual!: string;

  constructor(private router: Router) {
    //Evalúa el cambio entre página y si se realiza con éxito llama al método "quitarParametrosDeURL()".
    this.router.events.subscribe((event) => { 
      if (event instanceof NavigationEnd) {
        this.paginaActual = this.quitarParametrosDeURL(event.url);
        console.log("Página actual:",this.paginaActual);
      }
    });
  }

  /**
   * @function quitarParametrosDeURL - quita los parámetros de la dirección de la página actual en la aplicación.
   * @param {string } url - dirección de la página actual.
   * @returns devuelve la URL de la página actual, pero sin los parámetros.
   */
  private quitarParametrosDeURL(url: string): string {
    const urlSinParam = url.split('?'); //Solo toma el url hasta encontrarse con "?"
    return urlSinParam[0];
  }
}
