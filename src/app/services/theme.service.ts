import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private bm = new BehaviorSubject<boolean>(false);
  // true quando o card do perfil está centralizado na tela (modo "blood moon")
  bloodMoon$ = this.bm.asObservable();

  setBloodMoon(v: boolean): void {
    if (this.bm.value !== v) this.bm.next(v);
  }
}
