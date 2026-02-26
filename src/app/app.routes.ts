import { Routes } from '@angular/router';
import { Pokemon } from './components/pesquisa/pokemon/pokemon';
import { Pokemoninfo } from './components/info/pokemoninfo/pokemoninfo';
import { HomeTela } from './screens/homeTela/homeTela';
import { TelaPokemon } from './screens/Pokemon-tela/telaPokemon';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeTela },
  { path: 'pokemon', component: TelaPokemon },
  { path: 'pokemoninfo/:id', component: Pokemoninfo },

  { path: '**', redirectTo: 'home' }
];
