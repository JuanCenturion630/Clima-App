import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ClimaService {
  URL : string = ``;
  ApiClave : string = `43a115834f5124a863fcf902f1795048`; //Clave de mi cuenta en OpenWeatherMap API.
  
  constructor(private clienteHttp:HttpClient) {
    this.URL=`https://api.openweathermap.org/data/2.5/forecast?appid=${this.ApiClave}`;
  }

  /** Retorna un vector de cuarenta posiciones. Cada posición representa una hora prefijada por la API
   * (en intervalos de 3 horas desde 12:00 am), entonces las 40 posiciones representan 5 días.
   * @function getURL_Ciudad - retorna datos del clima según el nombre de una ciudad.
   * @param {string} ciudadBuscada 
   * @param {string} unidad - sistema métrico utilizado para mostrar los datos. Estándar o imperial.
   * @param {string} idioma - español o inglés.
   * @returns - devuelve un vector any luego de impactar con la API.
   */
  getURL_Ciudad(ciudadBuscada:string,unidad:string,idioma:string) {
    return this.clienteHttp.get(`${this.URL}&units=${unidad}&lang=${idioma}&q=${ciudadBuscada}&cnt=40`);
  }

  /**
   * @function getURL_Ciudad_HoraActual - retorna el clima de la hora actual según el nombre de una ciudad.
   * @param {string} ciudadBuscada 
   * @param {string} unidad - sistema métrico utilizado para mostrar los datos. Métrico o imperial.
   * @param {string} idioma - español o inglés.
   * @returns - devuelve un vector any luego de impacta con la API.
   */
  getURL_Ciudad_HoraActual(ciudadBuscada:string,unidad:string,idioma:string) {
    return this.clienteHttp.get(`https://api.openweathermap.org/data/2.5/weather?appid=${this.ApiClave}&units=${unidad}&lang=${idioma}&q=${ciudadBuscada}`);  
  }

  /** Retorna un vector de cuarenta posiciones. Cada posición representa una hora prefijada por la API
   * (en intervalos de 3 horas desde 12:00 am), entonces las 40 posiciones representan 5 días.
   * @function getURL_Coord - retorna datos del clima según coordenadas.
   * @param {number} lat - latitud.
   * @param {number} lon - longitud.
   * @param {string} unidad - sistema métrico utilizado para mostrar los datos. Estándar o imperial.
   * @param {string} idioma - español o inglés.
   * @returns - devuelve un vector any luego de impactar con la API.
   */
  getURL_Coord(lat:number,lon:number,unidad:string,idioma:string) {
    return this.clienteHttp.get(`${this.URL}&units=${unidad}&lang=${idioma}&lat=${lat}&lon=${lon}&cnt=40`);
  }

  /**
   * @function getURL_Coord_HoraActual - retorna el clima de la hora actual según coordenadas.
   * @param {number} lat - lalitud.
   * @param {number} lon - longitud.
   * @param {string} unidad - sistema métrico utilizado para mostrar los datos. Métrico o imperial.
   * @param {string} idioma - español o inglés.
   * @returns - devuelve un vector any luego de impactar con la API.
   */
  getURL_Coord_HoraActual(lat:number,lon:number,unidad:string,idioma:string) {
    return this.clienteHttp.get(`https://api.openweathermap.org/data/2.5/weather?appid=${this.ApiClave}&units=${unidad}&lang=${idioma}&lat=${lat}&lon=${lon}`);  
  }
}