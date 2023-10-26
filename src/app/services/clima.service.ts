import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'; //Desde el núcleo de Angular importo la clase HttpClient.

@Injectable({
  providedIn: 'root'
})

export class ClimaService {
  URL : string = ``;
  ApiClave : string = `43a115834f5124a863fcf902f1795048`; //Clave de mi cuenta en OpenWeatherMap API
  
  constructor(private clienteHttp:HttpClient) { //clienteHttp es una instancia de la clase HttpClient
    this.URL=`https://api.openweathermap.org/data/2.5/forecast?appid=${this.ApiClave}`;
  }

  /** Obtener URL en base a nombre de ciudad:
   * Impacta con la API y retorna vectores con datos del clima en función de los parámetros siguientes.
   * @param {string} ciudadBuscada 
   * @param {string} unidad - sistema métrico utilizado para mostrar los datos. Estándar o imperial.
   * @param {string} idioma
   * @returns - devuelve un vector luego de impactar con la API.
   */
  getURL_Ciudad(ciudadBuscada:string,unidad:string,idioma:string) {
    return this.clienteHttp.get(`${this.URL}&units=${unidad}&lang=${idioma}&q=${ciudadBuscada}&cnt=8`);
  }

  /** Obtener URL en base a las coordenadas:
   * Impacta con la API y retorna vectores con datos del clima en función de los parámetros siguientes.
   * @param lat - latitud.
   * @param lon - longitud.
   * @param unidad - sistema métrico utilizado para mostrar los datos. Estándar o imperial.
   * @param idioma
   * @returns - devuelve un vector luego de impactar con la API.
   */
  getURL_Coord(lat:number,lon:number,unidad:string,idioma:string) {
    return this.clienteHttp.get(`${this.URL}&units=${unidad}&lang=${idioma}&lat=${lat}&lon=${lon}&cnt=8`);
  }
}