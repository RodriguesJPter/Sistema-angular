import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { PokemonService } from '../../../services/pokemon.service';
import { take } from 'rxjs/operators'; 

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './menu-principal.html',
  styleUrl: './menu-principal.scss'
})
export class MenuPrincipal {
  public logo = 'assets/imagens/Logo_unholy_Studio_light.PNG';

  constructor(private router: Router, private pokemonService: PokemonService) {}

  // menu-principal.ts
 // No método irParaPokemon()
irParaPokemon() {
    this.router.navigate(['/']);
  }
}
