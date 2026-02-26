import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MenuPrincipal } from './components/menu/menu-principal/menu-principal';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { PokemonService } from './services/pokemon.service';

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
   <app-menu-principal/>

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
  title = 'first-project-latest';
}

