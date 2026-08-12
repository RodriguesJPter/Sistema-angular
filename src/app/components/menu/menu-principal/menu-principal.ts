import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
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

  // fica true quando a seção escura (Tecnologias) alcança o topo,
  // para escurecer a barra do menu e diferenciá-la do resto da tela
  menuEscuro = false;

  // alvos das "gotas" que se soltam do metaball em direção a cada bubble
  // (coordenadas de mundo do shader; y para cima é positivo -> bubbles ficam abaixo)
  dripTargets = [
    { x: 21, y: -12, size: 2.1 }, // bubble-1 (Pokedex)
    { x: 9,  y: -19, size: 1.9 }, // bubble-2 (Game)
    { x: -7, y: -21, size: 2.0 }  // bubble-3 (Home)
  ];

   constructor(
    private router: Router,
    private music: MusicService
   ) {}

  // cor do metaball acompanha o estado do menu
  get metaballColor(): string {
    return this.menuEscuro ? '#0C120A' : '#1A2517';
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    const dark = document.querySelector('.dark-section');
    if (!dark) {
      this.menuEscuro = false;
      return;
    }
    // escurece quando o topo da seção escura passa por baixo do menu
    this.menuEscuro = dark.getBoundingClientRect().top <= 80;
  }

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