import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  async mostrarToast(mensaje: string, color: string, icono: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 5000,
      position: 'top',
      color: color,
      icon: icono,
    });
    toast.present();
  }
}
