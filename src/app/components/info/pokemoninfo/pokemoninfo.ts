import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators,FormsModule } from '@angular/forms';
import { PokemonService } from '../../../services/pokemon.service'; 
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-pokemoninfo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './pokemoninfo.html',
  styleUrls: ['./pokemoninfo.scss'],
    animations: [
    trigger('fadeButtons', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ]),
    trigger('fadeInputs', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-5px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-5px)' }))
      ])
    ])
  ]
})

export class Pokemoninfo implements OnInit {
  pokemonOriginal: any = null; // Dados originais da API
  pokemonEditado: any = null;  // Cópia para edição
  modoEdicao = false;
  isLoading = true;
  errorMessage: string | null = null;
  private storageKey = 'pokemon_edicoes';

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const dadosTemp = sessionStorage.getItem('pokemon_detalhe_temp');
    if (dadosTemp) {
      const parsed = JSON.parse(dadosTemp);
      this.carregarDados(parsed);
      sessionStorage.removeItem('pokemon_detalhe_temp');
    } else {
      this.mostrarErro('Nenhum dado encontrado');
    }
  }

  private carregarPokemon(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    
    const dadosLocais = this.obterDadosLocais(id);
    if (dadosLocais) {
      this.carregarDados(dadosLocais);
      return;
    }

    
    this.pokemonService.getDetalhesPokemon(id).pipe(
      tap(() => console.log('Buscando dados da API...')),
      catchError(error => {
        this.mostrarErro('Erro ao carregar dados da API');
        console.error('Erro na API:', error);
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
        console.log('Carregamento finalizado');
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.carregarDados(data);
          this.salvarDadosLocais(data); 
        } else {
          this.mostrarErro('Pokémon não encontrado');
        }
      }
    });
  }

  private carregarDados(dados: any): void {
    this.pokemonOriginal = dados;
    this.pokemonEditado = JSON.parse(JSON.stringify(dados)); 
    this.isLoading = false;
  }

  private mostrarErro(mensagem: string): void {
    this.errorMessage = mensagem;
    this.isLoading = false;
    console.error(mensagem);
  }

  private obterDadosLocais(id: string): any {
    const edicoesSalvas = sessionStorage.getItem(this.storageKey);
    if (!edicoesSalvas) return null;

    try {
      const dados = JSON.parse(edicoesSalvas);
      return dados.find((p: any) => p.id === parseInt(id));
    } catch (e) {
      console.error('Erro ao ler sessionStorage:', e);
      return null;
    }
  }

  private salvarDadosLocais(dados: any): void {
    let edicoesSalvas = [];
    const dadosExistentes = sessionStorage.getItem(this.storageKey);
    
    if (dadosExistentes) {
      edicoesSalvas = JSON.parse(dadosExistentes);
      edicoesSalvas = edicoesSalvas.filter((p: any) => p.id !== dados.id);
    }
    
    edicoesSalvas.push(dados);
    sessionStorage.setItem(this.storageKey, JSON.stringify(edicoesSalvas));
  }

  entrarModoEdicao(): void {
    this.modoEdicao = true;
  }

  salvarEdicoes(): void {
    this.pokemonOriginal = { ...this.pokemonEditado };
    this.salvarDadosLocais(this.pokemonOriginal);
    this.modoEdicao = false;
  }

  cancelarEdicao(): void {
    this.pokemonEditado = JSON.parse(JSON.stringify(this.pokemonOriginal));
    this.modoEdicao = false;
  }

  voltarParaLista(): void {
    this.router.navigate(['/pokemon']);
  }
}
