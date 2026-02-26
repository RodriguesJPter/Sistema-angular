import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MetaballsComponent } from '../../metaballs/metaballs';
import { MusicPlayerComponent } from '../../music-player/music-player';
import { MusicService } from '../../../services/music.service';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    MetaballsComponent,
    MusicPlayerComponent
  ],
  templateUrl: './menu-principal.html',
  styleUrl: './menu-principal.scss'
})
export class MenuPrincipal {

  menuAberto = false;
  animando = false;
  menuTotalmenteAberto = false; 

   constructor(
    private router: Router,
    private music: MusicService
   ) {}

  toggleMenu() {

    if (this.animando) return;

    this.animando = true;
    this.menuAberto = !this.menuAberto;
  }

  onTransitionEnd(event: TransitionEvent) {

    if (event.propertyName !== 'transform') return;

    this.animando = false;

    if (this.menuAberto) {
      this.menuTotalmenteAberto = true;

      this.music.pause();
    } 
    else {
      this.menuTotalmenteAberto = false;

      this.music.resume();
    }
  }
  irParaPokemon(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/pokemon']);
  }

  irParaHome(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/home']);
  }
}