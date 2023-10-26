import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from '@angular/fire/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(private ngFireAuth: AngularFireAuth) { }

  async iniciarSesionConEmail(email: string, contrasenia: string): Promise<any> {
    try {
      const { user } = await this.ngFireAuth.signInWithEmailAndPassword(email, contrasenia);
      return user;
    } catch (error) {
      console.log('Error al iniciar sesión con Email: ', error);
    }
  }

  async resetearContrasenia(email: string): Promise<void> {
    try {
      return this.ngFireAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log('Error al resetear contraseña: ', error);
    }
  }

  async registrar(email: string, contrasenia: string): Promise<any> {
    try {
      this.cerrarSesion();

      const { user } = await this.ngFireAuth.createUserWithEmailAndPassword(email, contrasenia);
      
      if(user){
        this.iniciarSesionConEmail(email, contrasenia);
        await this.enviarEmailDeVerificacion();
      }
      
      return user;
    } catch (error) {
      console.log('Error al registrase: ', error);
    }
  }

  async iniciarSesionConGoogle(): Promise<any> {
    try {
      this.cerrarSesion();

      const { user } = await this.ngFireAuth.signInWithPopup(new GoogleAuthProvider());
      return user;
    } catch (error) {
      console.log('Error al iniciar sesión con Google: ', error);
    }
  }

  async enviarEmailDeVerificacion(): Promise<void> {
    try {
      return (await this.ngFireAuth.currentUser)?.sendEmailVerification();
    } catch (error) {
      console.log('Error al enviar email de verificación: ', error);
    }
  }

  async emailVerificado(): Promise<boolean> {
    try {
      const usuarioActual = await this.ngFireAuth.currentUser;
      return usuarioActual?.emailVerified === true;
    } catch (error) {
      console.log('Error al saber si el email está verificado: ', error);
      return false;
    }
  }

  async obtenerUsuarioActual(): Promise<firebase.User | null>{
    return await this.ngFireAuth.currentUser;
  }

  async cerrarSesion(): Promise<void> {
    try {
      await this.ngFireAuth.signOut();
    } catch (error) {
      console.log('Error al cerrar sesión: ', error);
    }
  }
}
