// app.routes.ts
import { Routes } from '@angular/router';
import { Pokemon } from './components/pesquisa/pokemon/pokemon';
import { Pokemoninfo } from './components/info/pokemoninfo/pokemoninfo';

export const routes: Routes = [
  { path: '', component: Pokemon },
  { path: 'pokemoninfo/:id', component: Pokemoninfo },
  { path: '**', redirectTo: '' }
];