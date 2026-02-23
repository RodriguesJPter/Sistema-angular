import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LayoutService {

  private router = inject(Router);

  constructor() {
    this.listenRouteChanges();
  }

  private listenRouteChanges() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {

        const rota = event.urlAfterRedirects.split('/')[1] || 'home';

        document.body.className = '';
        document.body.classList.add(`${rota}-layout`);
      });
  }
}