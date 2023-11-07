import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})

export class FirestoreService {
  constructor(private firestore: AngularFirestore) { }

  /**
   * @function crearUsuario - Crea un usuario, en la base de datos de Firestore.
   * @param data - Objeto con el uid del Usuario y sus ciudadesFavoritas.
   * @returns Promise<void>
   */
  crearUsuario(data: { uid: string, ciudadesFavoritas: string[] }) {
    const { 
      uid, 
      ciudadesFavoritas 
    } = data;
    return this.firestore.collection('usuarios').doc(uid).set({ ciudadesFavoritas });
  }

  /**
   * @function getUsuario - Obtiene los datos del Usuario de la base de datos de Firestore.
   * @param {string} uid - UID del usuario.
   * @returns Observable<Action<DocumentSnapshot<unknown>>>
   */
  getUsuario(uid: string) {
    return this.firestore.collection('usuarios').doc(uid).snapshotChanges();
  }

  /**
   * @function actualizarUsuario - Actualiza los datos del usuario (ciudades favoritas) con UID pasado por parámetro.
   * @param {string} uid - UID del usuario al que queremos actualizar los datos.
   * @param {any} data - Los datos que queremos sobreescribir del usuario. (Las ciudades favoritas, como un objeto).
   * @returns Promise<void>
   */
  actualizarUsuario(uid: string, data: any) {
    return this.firestore.collection('usuarios').doc(uid).set(data);
  }
}