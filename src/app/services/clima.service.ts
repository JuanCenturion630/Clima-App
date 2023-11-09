import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ClimaService {
  /** Links de documentación:
   * https://openweathermap.org/current : API del clima por hora actual.
   * https://openweathermap.org/forecast5 : API del clima por intervalos.
   * https://positionstack.com/documentation : API de geocodificación y geocodificación inversa.
   * https://docs.locationiq.com/docs/maps : API de gestión de mapas.
   */
  /** ADJUNTO:
   * La búsqueda por texto de OpenWeatherMap es limitada (solo ciudades), pero la búsqueda por coordenadas no, 
   * así que se usará también Position Stack para que el usuario pueda buscar por direcciones geocodificadas.
   * La página de OpenWeatherMap posee una API llamada Geocoding, pero pide código ISO 3166 del país y código postal
   * como parámetros obligatorios, así que se descartó.
   */
  url_OWM : string = ``; //Link a OpenWeatherMap: API del clima.
  key_OWM : string = `43a115834f5124a863fcf902f1795048`; //Clave de mi cuenta en OpenWeatherMap.
  url_PS : string = ``; //Link a Position Stack: API de geocodificación (recibir direcciones y dar coordenadas).
  url_PSgi : string = ``; //Link a Position Stack: API de geocodificación inversa.
  key_PS: string = `3d4449fb388b06a07a743b0600502b20`; //Clave de mi cuenta en Position Stack.
  url_LIQ : string = ``; //Link de Location IQ.
  key_LIQ : string = `pk.bf65017ca2656c90bf3cbe89134b922a`; //Clave de mi cuenta en Location IQ.
  
  constructor(private clienteHttp:HttpClient) {
    this.url_OWM=`https://api.openweathermap.org/data/2.5/forecast?appid=${this.key_OWM}`;
    this.url_PS=`http://api.positionstack.com/v1/forward?access_key=${this.key_PS}`;
    this.url_PSgi=`http://api.positionstack.com/v1/reverse?access_key=${this.key_PS}`;
    this.url_LIQ=`https://tiles.locationiq.com/v3/street/vector.json?key=${this.key_LIQ}`;
  }

  /**
   * @function getGeocodificacion - calcula coordenadas en base a direcciones.
   * @param {string} direccion 
   * @returns {HttpClient} - devuelve coordenadas.
   */
  getGeocodificacion(direccion:string) {
    return this.clienteHttp.get(`${this.url_PS}&query=${direccion}`);
  }

  /**
   * @function getGeocodificacionInversa - obtiene la dirección en texto en base a coordenadas.
   * @param {number} lat - latitud.
   * @param {number} long - longitud.
   * @returns {HttpClient} - devuelve una dirección.
   */
  getGeocodificacionInversa(lat:number,long:number) {
    return this.clienteHttp.get(`${this.url_PSgi}&query=${lat},${long}`);
  }

  /** 
   * @function getURL_Coord - datos del clima según coordenadas en intervalos de 3 horas hasta por 5 días.
   * @param {number} lat - latitud.
   * @param {number} lon - longitud.
   * @param {string} unidad - sistema de medición utilizado para mostrar los datos. Métrico o imperial.
   * @param {string} idioma - español o inglés.
   * @returns {HttpClient} - devuelve un vector de 40 posiciones: los 8 intervalos (de 3 horas) por día, dando 5 días.
   */
  getURL_Coord(lat:number,lon:number,unidad:string,idioma:string) {
    return this.clienteHttp.get(`${this.url_OWM}&units=${unidad}&lang=${idioma}&lat=${lat}&lon=${lon}&cnt=40`);
  }

  /**
   * @function getURL_Coord_HoraActual - datos del clima según coordenadas y hora actual.
   * @param {number} lat - lalitud.
   * @param {number} lon - longitud.
   * @param {string} unidad - sistema de medición utilizado para mostrar los datos. Métrico o imperial.
   * @param {string} idioma - español o inglés.
   * @returns {HttpClient} - devuelve un único valor: la temperatura de la hora actual.
   */
  getURL_Coord_HoraActual(lat:number,lon:number,unidad:string,idioma:string) {
    return this.clienteHttp.get(`https://api.openweathermap.org/data/2.5/weather?appid=${this.key_OWM}&units=${unidad}&lang=${idioma}&lat=${lat}&lon=${lon}`);  
  }
}