import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { PokemonService } from '../../../services/pokemon.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { PokemonDetalhado } from '../../../models/pokemon.model';
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-pokemon-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatFormFieldModule
  ],
  templateUrl: './pokemon-status.html',
  styleUrl: './pokemon-status.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class PokemonStatus implements OnInit {

  @Output() atualizarLista = new EventEmitter<void>();

  @Input() posicao = { top: 100, left: 100 };

  nomePesquisa = '';
  dadosPokemon: any = null;

  private arrastando = false;
  private offset = { x: 0, y: 0 };


constructor(
  private pokemonService: PokemonService,
  private router: Router,
) {}

  ngOnInit(): void {
    const pos = sessionStorage.getItem('widgetStatusPosicao');
    if (pos) this.posicao = JSON.parse(pos);

    const ultimaPesquisa = sessionStorage.getItem('ultimaPesquisaStatus');
    if (ultimaPesquisa) {
      this.nomePesquisa = ultimaPesquisa;
      this.buscarPokemon();
    }

    this.pokemonService.edicoes$.subscribe((edicoes: PokemonDetalhado[]) => {
      const pokemonEditado = edicoes.find(p => p.name.toLowerCase() === this.nomePesquisa.toLowerCase());
      if (pokemonEditado) {
        this.dadosPokemon = this.formatarDadosPokemon(pokemonEditado);
      }
    });
  }

  onMouseDown(event: MouseEvent): void {
    this.arrastando = true;
    this.offset = {
      x: event.clientX - this.posicao.left,
      y: event.clientY - this.posicao.top
    };
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.arrastando) {
      this.posicao.left = event.clientX - this.offset.x;
      this.posicao.top = event.clientY - this.offset.y;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.arrastando) {
      sessionStorage.setItem('widgetStatusPosicao', JSON.stringify(this.posicao));
    }
    this.arrastando = false;
  }

 buscarPokemon(): void {
  const nome = this.nomePesquisa.trim().toLowerCase();
  if (!nome) {
    this.dadosPokemon = null;
    sessionStorage.removeItem('ultimaPesquisaStatus');
    return;
  }

  this.pokemonService.getPokemonComEdicoes(nome).subscribe({
    next: (data) => {
      if (!data) {
        this.dadosPokemon = null;
        return;
      }

      this.dadosPokemon = this.formatarDadosPokemon(data);
      sessionStorage.setItem('ultimaPesquisaStatus', data.name);
    },
    error: () => this.dadosPokemon = null
  });
}


  private formatarDadosPokemon(data: any): any {
    return {
      nome: data.name,
      sprite: data.sprites?.front_default || 
             data.sprites?.other?.['official-artwork']?.front_default,
      ataque: data.stats?.find((s: any) => s.stat.name === 'attack')?.base_stat || 0,
      defesa: data.stats?.find((s: any) => s.stat.name === 'defense')?.base_stat || 0,
      tipo: data.types?.[0]?.type?.name || '',
      pokedex: data.id,
      stats: data.stats,
      sprites: data.sprites,
      height: data.height,
      weight: data.weight
    };
  }

  visualizar(): void {
    if (!this.dadosPokemon) return;

    this.pokemonService.getPokemonComEdicoes(this.dadosPokemon.nome).subscribe({
      next: (data) => {
        if (data) {
          sessionStorage.setItem('pokemon_detalhe_temp', JSON.stringify(data));
          this.router.navigate(['/pokemoninfo', data.id]);
        }
      }
    });
  }

private carregarDadosEditados(dados: any): void {
  this.dadosPokemon = {
    nome: dados.name,
    sprite: dados.sprites?.front_default,
    ataque: dados.stats?.find((s: any) => s.stat.name === 'attack')?.base_stat || 0,
    defesa: dados.stats?.find((s: any) => s.stat.name === 'defense')?.base_stat || 0,
    tipo: dados.types?.[0]?.type?.name || '',
    pokedex: dados.id,
    stats: dados.stats,
    sprites: dados.sprites
  };
  sessionStorage.setItem('ultimaPesquisaStatus', dados.name);
}

private carregarDadosApi(data: any): void {
  this.carregarDadosEditados({ 
    ...data,
    id: data.id,
    name: data.name
  });
}


  favoritar(): void {
    if (!this.dadosPokemon) return;
    
    const favs = JSON.parse(localStorage.getItem('pokemonsFavoritos') || '[]');
    const existe = favs.find((p: any) => p.name === this.dadosPokemon.nome);

    if (existe) {
      const index = favs.findIndex((p: any) => p.name === this.dadosPokemon.nome);
      favs.splice(index, 1);
    } else {
      if (favs.length >= 6) {
        alert('Você já tem 6 pokémons na sua equipe!');
        return;
      }
      favs.push({
        name: this.dadosPokemon.nome,
        sprite: this.dadosPokemon.sprite,
        tipo: this.dadosPokemon.tipo 
      });
    }
    this.atualizarLista.emit();
    localStorage.setItem('pokemonsFavoritos', JSON.stringify(favs));
  }

  isFavorito(): boolean {
    if (!this.dadosPokemon) return false;
    const favs = JSON.parse(localStorage.getItem('pokemonsFavoritos') || '[]');
    return favs.some((p: any) => p.name === this.dadosPokemon.nome);
  }

  limparSeVazio(): void {
    if (!this.nomePesquisa.trim()) {
      this.dadosPokemon = null;
      sessionStorage.removeItem('ultimaPesquisaStatus');
    }
  }

  handleImageError(event: any) {
    if (this.dadosPokemon?.sprites) {
      event.target.src = this.dadosPokemon.sprites.other?.['official-artwork']?.front_default || 
                        'assets/imagens/error.png';
    } else {
      event.target.src = 'assets/imagens/error.png';
    }
  }

  irParaInfo(): void {
    if (!this.dadosPokemon?.pokedex) return;

    this.pokemonService.getPokemonComEdicoes(this.dadosPokemon.pokedex).subscribe({
      next: (data) => {
        if (data) {
          sessionStorage.setItem('pokemon_detalhe_temp', JSON.stringify(data));
          this.router.navigate(['/pokemoninfo', data.id]);
        }
      },
      error: err => console.error('Erro ao buscar detalhes', err)
    });
  }

}
