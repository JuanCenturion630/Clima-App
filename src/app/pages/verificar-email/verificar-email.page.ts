import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-verificar-email',
  templateUrl: './verificar-email.page.html',
  styleUrls: ['./verificar-email.page.scss'],
})
export class VerificarEmailPage implements OnInit {
  emailVerificado!: boolean;
  emailReenviado: boolean = false;

  constructor(private authService: AuthService, private toastService: ToastService) { }

  ngOnInit() {
    this.obtenerValorDeEmailVerficado();
  }

  obtenerValorDeEmailVerficado(): void{
    this.authService.emailVerificado().then((respuesta) => {this.emailVerificado = respuesta});
  }

  async reenviarEmail(): Promise<void> {
    try {
      await this.authService.enviarEmailDeVerificacion();

      this.emailReenviado = true;

      await this.toastService.mostrarToast('Se le ha reenviado el email correctamente.', 'success', 'warning-outline');
    } catch (error) {
      console.log('Error al reenviar email de verificación: ', error);
      await this.toastService.mostrarToast('Ups... Ocurrió un problema al reenviar el email.', 'danger', 'warning-outline');
    }
  }
}
