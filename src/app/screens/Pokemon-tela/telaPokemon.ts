import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../components/pesquisa/pokemon/pokemon';

@Component({
  selector: 'app-tela-pokemon',
  standalone: true,
  imports: [
    CommonModule,
    Pokemon
  ],
  templateUrl: './telapokemon.html',
  styleUrls: ['./telaPokemon.scss']
})
export class TelaPokemon {}