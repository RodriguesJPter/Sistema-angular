import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MetaballsComponent } from '../../metaballs/metaballs';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    MetaballsComponent
  ],
  templateUrl: './menu-principal.html',
  styleUrl: './menu-principal.scss'
})
export class MenuPrincipal {

  menuAberto = false;
  animando = false;
  menuTotalmenteAberto = false; 

   constructor(private router: Router) {}

  toggleMenu() {

    if (this.animando) return;

    this.animando = true;
    this.menuAberto = !this.menuAberto;
  }

  onTransitionEnd(event: TransitionEvent) {

    if (event.propertyName !== 'transform') return;

    this.animando = false;

    // Se terminou abrindo
    if (this.menuAberto) {
      this.menuTotalmenteAberto = true;
    } 
    // Se terminou fechando
    else {
      this.menuTotalmenteAberto = false;
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