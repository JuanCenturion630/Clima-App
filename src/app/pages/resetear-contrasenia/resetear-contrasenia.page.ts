import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-resetear-contrasenia',
  templateUrl: './resetear-contrasenia.page.html',
  styleUrls: ['./resetear-contrasenia.page.scss'],
})
export class ResetearContraseniaPage implements OnInit {

  formularioResetearContrasenia = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(private authService: AuthService, private formBuilder: FormBuilder, private router: Router, private toastService: ToastService) { }

  ngOnInit() {
  }

  async resetearContrasenia(event: Event): Promise<void> {
    event.preventDefault();

    if (this.formularioResetearContrasenia.valid) {
      try {        
        let email = this.formularioResetearContrasenia.value.email as string;
        await this.authService.resetearContrasenia(email);

        this.router.navigate(['/login']);

        await this.toastService.mostrarToast('¡Email enviado!', 'success', 'checkmark-circle-outline');
      } catch (error) {
        console.log('Error al resetear contraseña: ', error);
        await this.toastService.mostrarToast('Ups... Ocurrió un problema.', 'danger', 'warning-outline');
      }
    } else {
      await this.toastService.mostrarToast('Por favor, ingrese un correo electrónico válido.', 'danger', 'warning-outline');
    }
  }
}
