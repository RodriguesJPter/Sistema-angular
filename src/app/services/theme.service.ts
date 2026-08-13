import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private bm = new BehaviorSubject<boolean>(false);

  bloodMoon$ = this.bm.asObservable();

  setBloodMoon(v: boolean): void {
    if (this.bm.value !== v) this.bm.next(v);
  }
}
