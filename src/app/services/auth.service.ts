import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from '@angular/fire/auth';
import firebase from 'firebase/compat/app';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(private ngFireAuth: AngularFireAuth, private firestore: FirestoreService) { }

  /**
   * @function iniciarSesionConEmail - Permite iniciar sesion con email, utilizando la API de Firebase.
   * Y, guarda el UID del Usuario en el LocalStorage.
   * @param {string} email - Email del Usuario
   * @param {string} contrasenia - Contrasenia del Usuario
   * @returns Promise<any> - retorna una Promesa con el Usuario (any)
   */
  async iniciarSesionConEmail(email: string, contrasenia: string): Promise<any> {
    try {
      const { user } = await this.ngFireAuth.signInWithEmailAndPassword(email, contrasenia);

      if (user) {
        let uid: string = user.uid;
        localStorage.setItem('uid', uid);
      }

      return user;
    } catch (error) {
      console.log('Error al iniciar sesión con Email: ', error);
    }
  }

  /**
   * @function resetearContrasenia - Resetea la contrasenia, del Usuario registrado con el email del parametro.
   * @param {string} email Email del Usuario que queremos que se reseteee la contrasenia.
   * @returns Promise<void>
   */
  async resetearContrasenia(email: string): Promise<void> {
    try {
      return this.ngFireAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log('Error al resetear contraseña: ', error);
    }
  }

  /**
   * @function registrarEnFirebase - Permite registrar a un Usuario, usando la API de Firebase. Cuando lo registra, 
   * envia email de verificacion. Ademas, crea el Usuario en la base de datos de Firestore utilizando el UID
   * y las ciudadesFavoritas como un array vacio.
   * @param {string} email Email del Usuario que se quiere registrar.
   * @param {string} contrasenia Contrasenia del Usuario que se quiere registrar.
   * @returns Promise<any> - retorna una Promsesa con los datos del Usuario (any)
   */
  async registrarEnFirebase(email: string, contrasenia: string): Promise<any> {
    try {
      this.cerrarSesion();

      const { user } = await this.ngFireAuth.createUserWithEmailAndPassword(email, contrasenia);

      if (user) {
        let busquedasPorDefecto: { nombre: string, icono: string, color: string } [] = [];

        let data = {
          uid: user.uid,
          busquedas: busquedasPorDefecto
        }

        this.firestore.crearUsuario(data);

        localStorage.setItem('uid', user.uid);

        this.iniciarSesionConEmail(email, contrasenia);
        await this.enviarEmailDeVerificacion();
      }

      return user;
    } catch (error) {
      console.log('Error al registrase: ', error);
    }
  }

  /**
   * @function iniciarSesionConGoogle - Permite iniciar sesion con una cuenta de Google (Gmail), 
   * utilizando la API de Firebase. Y guarda el UID del Usuario en el LocalStorage.
   * @returns Promise<any> - retorna una Promesa con los datos del Usuario (any).
   */
  async iniciarSesionConGoogle(): Promise<any> {
    try {
      this.cerrarSesion();

      const { user } = await this.ngFireAuth.signInWithPopup(new GoogleAuthProvider());

      if (user) {
        let uid: string = user.uid;
        
        this.firestore.getUsuario(uid).subscribe((data) => {
          const usuarioData: any = data.payload.data();
          
          if (!usuarioData) {
            let busquedasPorDefecto: { nombre: string, icono: string, color: string } [] = [];

            let data = {
              uid: user.uid,
              busquedas: busquedasPorDefecto
            }

            this.firestore.crearUsuario(data);
          }
        });

        localStorage.setItem('uid', uid);
      }

      return user;
    } catch (error) {
      console.log('Error al iniciar sesión con Google: ', error);
    }
  }

  /**
   * @function enviarEmailDeVerificacion - Envia un email de verifiacion de cuenta, al Usuario logeado.
   * @returns Promise<void>
   */
  async enviarEmailDeVerificacion(): Promise<void> {
    try {
      return (await this.ngFireAuth.currentUser)?.sendEmailVerification();
    } catch (error) {
      console.log('Error al enviar email de verificación: ', error);
    }
  }

  /**
   * @function emailVerificado - Averigua si el email, del Usuario logeado, esta verificado o no.
   * @returns Promise<boolean>
   */
  async emailVerificado(): Promise<boolean> {
    try {
      const usuarioActual = await this.ngFireAuth.currentUser;
      return usuarioActual?.emailVerified === true;
    } catch (error) {
      console.log('Error al saber si el email está verificado: ', error);
      return false;
    }
  }

  /**
   * No esta en uso creo.
   * @function obtenerUsuarioActual - Obtiene toda la informacion del Usuario logeado actualmente.
   * @returns Promise<firebase.User | null>
   */
  async obtenerUsuarioActual(): Promise<firebase.User | null> {
    return await this.ngFireAuth.currentUser;
  }

  /**
   * @function cerrarSesion - Cierra la sesion del Usuario logeado.
   * @returns Promise<void>
   */
  async cerrarSesion(): Promise<void> {
    try {
      await this.ngFireAuth.signOut();
      localStorage.removeItem("uid");
    } catch (error) {
      console.log('Error al cerrar sesión: ', error);
    }
  }
}