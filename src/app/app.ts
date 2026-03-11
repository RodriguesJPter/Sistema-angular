import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MenuPrincipal } from './components/menu/menu-principal/menu-principal';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MusicService } from './services/music.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    MenuPrincipal, 
    MatIconModule, 
    RouterOutlet, 
  ],
  template: `
  <app-menu-principal *ngIf="showMenu"></app-menu-principal>
  
  <div class="main-content">
    <router-outlet></router-outlet>
   
  </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: 0px;
    }
    
    .content {
      flex: 1;
      padding: 60px;
      margin-top: 160px; 
    }
  `]

})
export class App {

  showMenu = true;

  constructor(
    private router: Router,
    private music: MusicService
  ) {

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {

      const url = event.urlAfterRedirects;

      // esconde menu na rota start
      this.showMenu = !url.includes('start');

      // START → sem música
      if (url.includes('start')) {
        this.music.pause();
      } 
      
      // qualquer outra tela → música toca
      else {
        this.music.resume();
      }

    });
  }
}

