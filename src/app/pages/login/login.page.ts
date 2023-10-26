import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { GeolocalizacionService } from 'src/app/services/geolocalizacion.service';
import { ToastService } from 'src/app/services/toast.service';

import { Geolocation } from '@capacitor/geolocation';
import { NavigationExtras } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  formularioLogin = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    contrasenia: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(private authService: AuthService, private formBuilder: FormBuilder, private router: Router, private toastService: ToastService, private conexGeo:GeolocalizacionService) { }

  async iniciarSesionConEmail(event: Event): Promise<void> {
    event.preventDefault();

    if (this.formularioLogin.valid) {
      try {
        let email = this.formularioLogin.value.email as string;
        let contrasenia = this.formularioLogin.value.contrasenia as string;
  
        const usuarioLogeado = await this.authService.iniciarSesionConEmail(email, contrasenia);
  
        if (usuarioLogeado) {
          const estaVerificado: boolean = await this.authService.emailVerificado();
          this.redireccionarUsuario(estaVerificado);

          await this.toastService.mostrarToast('¡Bienvenido!', 'success', 'checkmark-circle-outline');
        }
      } catch (error) {
        console.log('Error al iniciar sesión con email: ', error);
        await this.toastService.mostrarToast('Ups... Ocurrió un problema al iniciar sesión con Email.', 'danger', 'warning-outline');
      }
    } else {
      await this.toastService.mostrarToast('Por favor, ingrese correo electrónico y contraseña válidos.', 'danger', 'warning-outline');
    }
  }

  async iniciarSesionConGoogle(): Promise<void> {
    try {
      const usuarioLogeado: any = await this.authService.iniciarSesionConGoogle();

      if (usuarioLogeado) {
        const estaVerificado = await this.authService.emailVerificado();
        this.redireccionarUsuario(estaVerificado);

        await this.toastService.mostrarToast('¡Bienvenido!', 'success', 'checkmark-circle-outline');
      } else {
        await this.toastService.mostrarToast('Ups... Ocurrió un problema al iniciar sesión con Google.', 'danger', 'warning-outline');
      }
    } catch (error) {
      console.log('Error al iniciar sesión con Google: ', error);
      await this.toastService.mostrarToast('Ups... Ocurrió un problema al iniciar sesión con Google.', 'danger', 'warning-outline');
    }
  }

  private async redireccionarUsuario(estaVerificado: boolean): Promise<void> {
	  if (estaVerificado) {
  	  let latitud: number;
  	  let longitud: number;

  	  const coordinates = await Geolocation.getCurrentPosition();

    	latitud = coordinates.coords.latitude;
    	longitud = coordinates.coords.longitude;

    	const navigationExtras: NavigationExtras = {
      	queryParams: {
        	lat: latitud,
        	long: longitud
      	}
    	};
    	this.router.navigate(['clima'], navigationExtras);
	  } else {
  	this.router.navigate(['verificar-email']);
	  }
  }
}
