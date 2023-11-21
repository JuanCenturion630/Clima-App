import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReiniciarService {

  constructor() { }

  private reiniciando = new BehaviorSubject<boolean>(false);
  estadoReiniciar$ = this.reiniciando.asObservable();

  iniciarReinicio() {
    this.reiniciando.next(true);
  }

  reinicioCompletado() {
    this.reiniciando.next(false);
  }
}
